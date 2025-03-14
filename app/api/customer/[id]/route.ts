import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import dbService from "@/lib/db-service"
import { generateResponse, parseResponse, prepareCustomerPrompt } from "@/lib/llm-service"
import { broadcastNewPendingQuery } from "@/lib/socket-service"
import type { LLMConfig, Message } from "@/types"

export async function POST(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    // Wait for params to resolve
    const { id: apiId } = await context.params;
    const body = await request.json()
    const { message, customerName } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Get the API instance
    const apiInstance = await dbService.getApiInstance(apiId)

    if (!apiInstance) {
      return NextResponse.json({ error: "API not found" }, { status: 404 })
    }

    if (!apiInstance.isRunning) {
      return NextResponse.json({ error: "API is not running" }, { status: 400 })
    }

    // Create a new query
    const queryId = uuidv4()
    const query = {
      id: queryId,
      customerApiId: apiId,
      customerName: customerName || "Anonymous",
      question: message,
      customerResponse: "",
      internalNote: "",
      status: "NEW" as "NEW" | "PENDING_HUMAN" | "COMPLETED",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await dbService.saveQuery(query)

    // Prepare LLM config
    const [provider, model] = apiInstance.llmType.split("/")
    const llmConfig: LLMConfig = {
      provider: provider as any,
      model: model,
      systemPrompt: prepareCustomerPrompt(message, "Your Company"),
    }

    // Generate response from LLM
    const messages: Message[] = [
      {
        role: "user",
        content: message,
        timestamp: new Date(),
      },
    ]

    const llmResponse = await generateResponse(messages, llmConfig)

    // Parse response to separate customer-facing content from internal notes
    const { visibleResponse, hiddenMessage } = parseResponse(llmResponse)

    // Update query with response
    query.customerResponse = visibleResponse

    if (hiddenMessage) {
      query.internalNote = hiddenMessage
      query.status = "PENDING_HUMAN"

      // Broadcast to backend APIs
      broadcastNewPendingQuery(query)
    } else {
      query.status = "COMPLETED"
    }

    await dbService.saveQuery(query)

    return NextResponse.json({
      queryId,
      response: visibleResponse,
      status: query.status,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error processing customer request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

