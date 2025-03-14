import type { NextApiRequest } from "next"
import { NextResponse } from "next/server"
import type { Server as NetServer } from "http"
import { initSocketServer } from "@/lib/socket-service"

// This is a workaround to make Socket.IO work with Next.js API routes
// In a production environment, you would use a custom server.js file
export async function GET(req: Request) {
  // Create a response object that will be used to upgrade the connection
  const res = new NextResponse()

  // Get the raw Node.js request and response objects
  const reqAsNextApiRequest = req as unknown as NextApiRequest
  const resAsNodeResponse = res as unknown as any

  // Initialize Socket.IO server if it doesn't exist
  if (reqAsNextApiRequest.socket) {
    const server = reqAsNextApiRequest.socket.server as any

    if (!server.io) {
      console.log("Initializing Socket.IO server...")
      server.io = initSocketServer(server as NetServer)
    }
  }

  // Return a 200 response to acknowledge the connection
  return new NextResponse("Socket.IO server running")
}

