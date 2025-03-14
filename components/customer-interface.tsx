"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { io, type Socket } from "socket.io-client"
import { Bot, Send, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAPI } from "@/contexts/api-context"

type Message = {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  pending?: boolean
}

export function CustomerInterface() {
  const { apis } = useAPI()
  const customerApis = apis.filter((api) => api.type === "CUSTOMER" && api.isRunning)

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm an AI representative from our company. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [selectedAPI, setSelectedAPI] = useState<string>("")
  const [customerName, setCustomerName] = useState("John Doe")
  const [isLoading, setIsLoading] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [currentQueryId, setCurrentQueryId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize socket connection
  useEffect(() => {
    if (!socket) {
      const newSocket = io("/customer", {
        path: "/api/socketio",
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      newSocket.on("connect", () => {
        console.log("Connected to customer socket")
      })

      newSocket.on("query-received", (data) => {
        console.log("Query received:", data)
      })

      newSocket.on("query-updated", (data) => {
        console.log("Query updated:", data)

        if (data.queryId === currentQueryId) {
          // Update the pending message with the response
          setMessages((prev) =>
            prev.map((msg, index) =>
              index === prev.length - 1 && msg.pending ? { ...msg, content: data.response, pending: false } : msg,
            ),
          )

          setIsLoading(false)
        }
      })

      newSocket.on("disconnect", () => {
        console.log("Disconnected from customer socket")
      })

      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
      }
    }
  }, [currentQueryId])

  // Set default selected API when APIs are loaded
  useEffect(() => {
    if (customerApis.length > 0 && !selectedAPI) {
      setSelectedAPI(customerApis[0].id)
    }
  }, [customerApis, selectedAPI])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !selectedAPI) return

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    // Add pending assistant message
    const pendingMessage: Message = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
      pending: true,
    }

    setMessages((prev) => [...prev, userMessage, pendingMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Send query to API
      const response = await fetch(`/api/customer/${selectedAPI}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          customerName,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send query")
      }

      const data = await response.json()

      // Update the pending message with the response
      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 ? { ...msg, content: data.response, pending: false } : msg,
        ),
      )

      // If query is pending human response, subscribe to updates
      if (data.status === "PENDING_HUMAN") {
        setCurrentQueryId(data.queryId)

        if (socket) {
          socket.emit("subscribe-to-query", data.queryId)
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)

      // Update the pending message with an error
      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1
            ? {
                ...msg,
                content: "Sorry, there was an error processing your request. Please try again.",
                pending: false,
              }
            : msg,
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleSend()
    }
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="w-5 h-5 mr-2" />
          AI Customer Service
        </CardTitle>
        <CardDescription>
          <div className="flex items-center justify-between">
            <span>Connected to API:</span>
            <Select value={selectedAPI} onValueChange={setSelectedAPI}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select API" />
              </SelectTrigger>
              <SelectContent>
                {customerApis.map((api) => (
                  <SelectItem key={api.id} value={api.id}>
                    {api.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] overflow-y-auto space-y-4 p-4 border rounded-md">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${
                  message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    message.role === "user" ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Bot className="w-4 h-4 text-secondary-foreground" />
                  )}
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  } ${message.pending ? "animate-pulse" : ""}`}
                >
                  {message.content || (message.pending ? "Typing..." : "")}
                  <div className="mt-1 text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || !selectedAPI}
          />
          <Button size="icon" onClick={handleSend} disabled={isLoading || !selectedAPI || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

