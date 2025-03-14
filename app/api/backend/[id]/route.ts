import { type NextRequest, NextResponse } from "next/server"
import dbService from "@/lib/db-service"
import { generateResponse, preparePromptWithHumanResponse } from "@/lib/llm-service"
import { sendToCustomer } from "@/lib/socket-service"
import type { LLMConfig, Message } from "@/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const apiId = params.id

    // Get the API instance
    const apiInstance = await dbService.getApiInstance(apiId)

    if (!apiInstance) {
      return NextResponse.json({ error: "API not found" }, { status: 404 })
    }

    if (!apiInstance.isRunning) {
      return NextResponse.json({ error: "API is not running" }, { status: 400 })
    }

    // Get pending queries
    const pendingQueries = await dbService.getQueriesByStatus("PENDING_HUMAN")

    return NextResponse.json({
      queries: pendingQueries,
      apiId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching pending queries:", error)
    return NextResponse.json({ error: "Failed to fetch pending queries" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const apiId = params.id
    const body = await request.json()
    const { queryId, response } = body

    if (!queryId || !response) {
      return NextResponse.json({ error: "QueryId and response are required" }, { status: 400 })
    }

    // Get the API instance
    const apiInstance = await dbService.getApiInstance(apiId)

    if (!apiInstance) {
      return NextResponse.json({ error: "API not found" }, { status: 404 })
    }

    if (!apiInstance.isRunning) {
      return NextResponse.json({ error: "API is not running" }, { status: 400 })
    }

    // Get the query
    const query = await dbService.getQueryById(queryId)

    if (!query) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 })
    }

    // Update query with human response
    query.internalNote += `\n[HUMAN RESPONSE: ${response}]`
    query.status = "ANSWERED_BY_HUMAN"

    await dbService.saveQuery(query)

    // Get the customer API
    const customerApi = await dbService.getApiInstance(query.customerApiId)

    if (!customerApi) {
      return NextResponse.json({ error: "Customer API not found" }, { status: 404 })
    }

    // Prepare LLM config
    const [provider, model] = customerApi.llmType.split("/")
    const llmConfig: LLMConfig = {
      provider: provider as any,
      model: model,
    }

    // Generate customer-friendly response
    const messages: Message[] = [
      {
        role: "system",
        content: preparePromptWithHumanResponse(query.question, response),
        timestamp: new Date(),
      },
    ]

    const customerResponse = await generateResponse(messages, llmConfig)

    // Update the query with the new customer response
    query.customerResponse = customerResponse
    query.status = "COMPLETED"
    await dbService.saveQuery(query)

    // Notify customer about the updated response
    sendToCustomer(queryId, "query-updated", {
      queryId,
      response: customerResponse,
    })

    return NextResponse.json({
      success: true,
      queryId,
      apiId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error processing backend response:", error)
    return NextResponse.json({ error: "Failed to process response" }, { status: 500 })
  }
}

