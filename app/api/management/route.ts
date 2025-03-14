import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import dbService from "@/lib/db-service"
import type { ApiInstance } from "@/types"

export async function GET() {
  try {
    const apiInstances = await dbService.getAllApiInstances()

    return NextResponse.json({
      apis: apiInstances,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching API instances:", error)
    return NextResponse.json({ error: "Failed to fetch API instances" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, llmType } = body

    if (!name || !type || !llmType) {
      return NextResponse.json({ error: "Name, type, and llmType are required" }, { status: 400 })
    }

    // Create new API instance
    const apiInstance: ApiInstance = {
      id: uuidv4(),
      name,
      type,
      llmType,
      isRunning: false,
      endpoint: `/api/${type.toLowerCase()}/${uuidv4()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await dbService.saveApiInstance(apiInstance)

    return NextResponse.json({
      api: apiInstance,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error creating API instance:", error)
    return NextResponse.json({ error: "Failed to create API instance" }, { status: 500 })
  }
}

