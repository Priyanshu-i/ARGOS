import { type NextRequest, NextResponse } from "next/server"
import dbService from "@/lib/db-service"
import { broadcastApiStatusChange } from "@/lib/socket-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const apiId = params.id

    const apiInstance = await dbService.getApiInstance(apiId)

    if (!apiInstance) {
      return NextResponse.json({ error: "API not found" }, { status: 404 })
    }

    return NextResponse.json({
      api: apiInstance,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching API instance:", error)
    return NextResponse.json({ error: "Failed to fetch API instance" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const apiId = params.id
    const body = await request.json()

    const apiInstance = await dbService.getApiInstance(apiId)

    if (!apiInstance) {
      return NextResponse.json({ error: "API not found" }, { status: 404 })
    }

    // Update API instance
    const updatedApiInstance = {
      ...apiInstance,
      ...body,
      updatedAt: new Date(),
    }

    await dbService.saveApiInstance(updatedApiInstance)

    // If isRunning status changed, broadcast to all clients
    if ("isRunning" in body && body.isRunning !== apiInstance.isRunning) {
      broadcastApiStatusChange(apiId, body.isRunning)
    }

    return NextResponse.json({
      api: updatedApiInstance,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error updating API instance:", error)
    return NextResponse.json({ error: "Failed to update API instance" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const apiId = params.id

    const success = await dbService.deleteApiInstance(apiId)

    if (!success) {
      return NextResponse.json({ error: "API not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error deleting API instance:", error)
    return NextResponse.json({ error: "Failed to delete API instance" }, { status: 500 })
  }
}

