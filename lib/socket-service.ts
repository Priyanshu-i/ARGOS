import type { Server as NetServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import type { Query } from "@/types"

// Global variable to store the Socket.IO server instance
let io: SocketIOServer | null = null

// Initialize Socket.IO server
export function initSocketServer(server: NetServer) {
  if (io) return io

  io = new SocketIOServer(server, {
    path: "/api/socketio",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  // Set up namespaces
  const customerNamespace = io.of("/customer")
  const backendNamespace = io.of("/backend")

  // Handle customer connections
  customerNamespace.on("connection", (socket) => {
    console.log("Customer client connected:", socket.id)

    // Handle customer query
    socket.on("submit-query", async (data) => {
      const { apiId, query, customerName } = data
      console.log(`Received query from ${customerName} for API ${apiId}: ${query}`)

      // Emit event to backend namespace
      backendNamespace.emit("new-query", {
        id: `q${Date.now()}`,
        customerApiId: apiId,
        question: query,
        customerName,
        timestamp: new Date(),
      })

      // Send acknowledgment back to customer
      socket.emit("query-received", {
        message: "Your query has been received and is being processed.",
      })
    })

    // Subscribe to updates for a specific query
    socket.on("subscribe-to-query", (queryId) => {
      socket.join(`query-${queryId}`)
      console.log(`Customer subscribed to query ${queryId}`)
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Customer client disconnected:", socket.id)
    })
  })

  // Handle backend connections
  backendNamespace.on("connection", (socket) => {
    console.log("Backend client connected:", socket.id)

    // Handle human response submission
    socket.on("submit-response", (data) => {
      const { queryId, response } = data
      console.log(`Human response for query ${queryId}: ${response}`)

      // Notify the customer that was waiting for a response
      customerNamespace.to(`query-${queryId}`).emit("query-updated", {
        queryId,
        response,
      })

      // Notify all backend clients that this query is now completed
      backendNamespace.emit("query-completed", { queryId })
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Backend client disconnected:", socket.id)
    })
  })

  return io
}

// Function to send a message to a specific customer
export function sendToCustomer(queryId: string, event: string, data: any) {
  if (!io) throw new Error("Socket.IO server not initialized")
  io.of("/customer").to(`query-${queryId}`).emit(event, data)
}

// Function to broadcast a message to all backend clients
export function broadcastToBackend(event: string, data: any) {
  if (!io) throw new Error("Socket.IO server not initialized")
  io.of("/backend").emit(event, data)
}

// Function to broadcast a message to all customer clients
export function broadcastToCustomers(event: string, data: any) {
  if (!io) throw new Error("Socket.IO server not initialized")
  io.of("/customer").emit(event, data)
}

// Function to broadcast a new pending query to all backend clients
export function broadcastNewPendingQuery(query: Query) {
  broadcastToBackend("new-pending-query", query)
}

// Function to notify about API status changes
export function broadcastApiStatusChange(apiId: string, isRunning: boolean) {
  if (!io) throw new Error("Socket.IO server not initialized")
  io.emit("api-status-changed", { apiId, isRunning })
}

