// This would be implemented with a real WebSocket server in production
// For this demo, we'll create a simulated WebSocket service

import { EventEmitter } from "events"

// Create a global event emitter to simulate WebSocket connections
const eventEmitter = new EventEmitter()

// Set max listeners to avoid memory leak warnings
eventEmitter.setMaxListeners(100)

// Types for messages
export type WebSocketMessage = {
  type: "customer_query" | "employee_response" | "api_status" | "notification"
  payload: any
  timestamp: string
}

// Function to send a message to a specific channel
export function sendMessage(channel: string, message: WebSocketMessage) {
  eventEmitter.emit(channel, message)
}

// Function to listen for messages on a specific channel
export function listenForMessages(channel: string, callback: (message: WebSocketMessage) => void) {
  eventEmitter.on(channel, callback)

  // Return a function to remove the listener
  return () => {
    eventEmitter.off(channel, callback)
  }
}

// Function to broadcast a message to all clients
export function broadcastMessage(message: WebSocketMessage) {
  eventEmitter.emit("broadcast", message)
}

// Function to simulate a WebSocket connection
export function connectToWebSocket(
  channel: string,
  onMessage: (message: WebSocketMessage) => void,
  onConnect?: () => void,
  onDisconnect?: () => void,
) {
  // Simulate connection delay
  setTimeout(() => {
    if (onConnect) onConnect()

    // Set up listener
    const cleanup = listenForMessages(channel, onMessage)

    // Also listen for broadcast messages
    const broadcastCleanup = listenForMessages("broadcast", onMessage)

    // Return a function to disconnect
    return () => {
      cleanup()
      broadcastCleanup()
      if (onDisconnect) onDisconnect()
    }
  }, 500)

  // Return a dummy function for immediate use
  return () => {}
}

