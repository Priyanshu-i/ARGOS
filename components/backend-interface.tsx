"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { io, type Socket } from "socket.io-client"
import { Bot, Check, Clock, MessageSquare, Send, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAPI } from "@/contexts/api-context"
import type { Query, QueryStatus } from "@/types"

type Message = {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

export function BackendInterface() {
  const { apis } = useAPI()
  const backendApis = apis.filter((api) => api.type === "BACKEND" && api.isRunning)

  const [selectedAPI, setSelectedAPI] = useState<string>("")
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [queries, setQueries] = useState<Query[]>([])
  const [conversations, setConversations] = useState<Record<string, Message[]>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize socket connection
  useEffect(() => {
    if (!socket) {
      const newSocket = io("/backend", {
        path: "/api/socketio",
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      newSocket.on("connect", () => {
        console.log("Connected to backend socket")
      })

      newSocket.on("new-pending-query", (query: Query) => {
        console.log("New pending query:", query)

        // Add query to list
        setQueries((prev) => [...prev, query])

        // Initialize conversation
        setConversations((prev) => ({
          ...prev,
          [query.id]: [
            {
              role: "system",
              content: "Customer query escalated to human employee",
              timestamp: new Date(query.createdAt),
            },
            {
              role: "user",
              content: query.question,
              timestamp: new Date(query.createdAt),
            },
          ],
        }))
      })

      newSocket.on("query-completed", (data) => {
        console.log("Query completed:", data)

        // Update query status
        setQueries((prev) =>
          prev.map((query) => (query.id === data.queryId ? { ...query, status: "COMPLETED" as QueryStatus } : query)),
        )
      })

      newSocket.on("disconnect", () => {
        console.log("Disconnected from backend socket")
      })

      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
      }
    }
  }, [])

  // Set default selected API when APIs are loaded
  useEffect(() => {
    if (backendApis.length > 0 && !selectedAPI) {
      setSelectedAPI(backendApis[0].id)
    }
  }, [backendApis, selectedAPI])

  // Fetch pending queries when API is selected
  useEffect(() => {
    if (selectedAPI) {
      fetchPendingQueries()
    }
  }, [selectedAPI])

  const fetchPendingQueries = async () => {
    if (!selectedAPI) return

    try {
      const response = await fetch(`/api/backend/${selectedAPI}`)

      if (!response.ok) {
        throw new Error("Failed to fetch pending queries")
      }

      const data = await response.json()

      // Initialize queries
      setQueries(data.queries)

      // Initialize conversations
      const newConversations: Record<string, Message[]> = {}

      data.queries.forEach((query: Query) => {
        newConversations[query.id] = [
          {
            role: "system",
            content: "Customer query escalated to human employee",
            timestamp: new Date(query.createdAt),
          },
          {
            role: "user",
            content: query.question,
            timestamp: new Date(query.createdAt),
          },
        ]

        // If query has a response, add it
        if (query.customerResponse) {
          newConversations[query.id].push({
            role: "assistant",
            content: query.customerResponse,
            timestamp: new Date(query.updatedAt),
          })
        }
      })

      setConversations(newConversations)
    } catch (error) {
      console.error("Error fetching pending queries:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (selectedQuery) {
      scrollToBottom()
    }
  }, [selectedQuery, conversations])

  const handleSend = async () => {
    if (!input.trim() || !selectedQuery || !selectedAPI) return

    // Add employee message to conversation
    const newMessage: Message = {
      role: "assistant",
      content: input,
      timestamp: new Date(),
    }

    setConversations((prev) => ({
      ...prev,
      [selectedQuery]: [...(prev[selectedQuery] || []), newMessage],
    }))

    // Update query status to in progress
    setQueries((prev) =>
      prev.map((query) => (query.id === selectedQuery ? { ...query, status: "ANSWERED_BY_HUMAN" as const } : query)),
    )

    setInput("")
    setIsLoading(true)

    try {
      // Send response to API
      const response = await fetch(`/api/backend/${selectedAPI}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          queryId: selectedQuery,
          response: input,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send response")
      }

      // Update query status to completed
      setQueries((prev) =>
        prev.map((query) => (query.id === selectedQuery ? { ...query, status: "COMPLETED" as const } : query)),
      )

      // If socket is connected, emit event
      if (socket) {
        socket.emit("submit-response", {
          queryId: selectedQuery,
          response: input,
        })
      }
    } catch (error) {
      console.error("Error sending response:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleSend()
    }
  }

  const handleQueryClick = (queryId: string) => {
    setSelectedQuery(queryId)

    // If query is pending, mark it as in-progress
    setQueries((prev) =>
      prev.map((query) =>
        query.id === queryId && query.status === "PENDING_HUMAN"
          ? { ...query, status: "ANSWERED_BY_HUMAN" as const }
          : query,
      ),
    )
  }

  const getStatusBadge = (status: QueryStatus) => {
    switch (status) {
      case "PENDING_HUMAN":
        return (
          <Badge variant="destructive">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        )
      case "ANSWERED_BY_HUMAN":
        return (
          <Badge variant="outline">
            <MessageSquare className="w-3 h-3 mr-1" /> In Progress
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge variant="default">
            <Check className="w-3 h-3 mr-1" /> Answered
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" /> New
          </Badge>
        )
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-6xl">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Pending Queries</CardTitle>
          <CardDescription>
            <div className="flex items-center justify-between">
              <span>Backend API:</span>
              <Select value={selectedAPI} onValueChange={setSelectedAPI}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select API" />
                </SelectTrigger>
                <SelectContent>
                  {backendApis.map((api) => (
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
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="answered">Answered</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4 space-y-2">
              {queries
                .filter((q) => q.status === "PENDING_HUMAN")
                .map((query) => (
                  <div
                    key={query.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-accent ${
                      selectedQuery === query.id ? "border-primary bg-accent" : ""
                    }`}
                    onClick={() => handleQueryClick(query.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{query.customerName}</div>
                      {getStatusBadge(query.status)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{query.question}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(query.createdAt).toLocaleTimeString()} · API {query.customerApiId}
                    </div>
                  </div>
                ))}
              {queries.filter((q) => q.status === "PENDING_HUMAN").length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No pending queries</div>
              )}
            </TabsContent>

            <TabsContent value="in-progress" className="mt-4 space-y-2">
              {queries
                .filter((q) => q.status === "ANSWERED_BY_HUMAN")
                .map((query) => (
                  <div
                    key={query.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-accent ${
                      selectedQuery === query.id ? "border-primary bg-accent" : ""
                    }`}
                    onClick={() => handleQueryClick(query.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{query.customerName}</div>
                      {getStatusBadge(query.status)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{query.question}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(query.createdAt).toLocaleTimeString()} · API {query.customerApiId}
                    </div>
                  </div>
                ))}
              {queries.filter((q) => q.status === "ANSWERED_BY_HUMAN").length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No in-progress queries</div>
              )}
            </TabsContent>

            <TabsContent value="answered" className="mt-4 space-y-2">
              {queries
                .filter((q) => q.status === "COMPLETED")
                .map((query) => (
                  <div
                    key={query.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-accent ${
                      selectedQuery === query.id ? "border-primary bg-accent" : ""
                    }`}
                    onClick={() => handleQueryClick(query.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{query.customerName}</div>
                      {getStatusBadge(query.status)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{query.question}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(query.createdAt).toLocaleTimeString()} · API {query.customerApiId}
                    </div>
                  </div>
                ))}
              {queries.filter((q) => q.status === "COMPLETED").length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No answered queries</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedQuery
              ? `Conversation with ${queries.find((q) => q.id === selectedQuery)?.customerName}`
              : "Select a query to respond"}
          </CardTitle>
          {selectedQuery && (
            <CardDescription>
              Query from API {queries.find((q) => q.id === selectedQuery)?.customerApiId} ·
              {new Date(queries.find((q) => q.id === selectedQuery)?.createdAt || 0).toLocaleString()}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {selectedQuery ? (
            <div className="h-[400px] overflow-y-auto space-y-4 p-4 border rounded-md">
              {conversations[selectedQuery]?.map((message, index) => (
                <div key={index} className={`flex ${message.role === "assistant" ? "justify-end" : "justify-start"}`}>
                  {message.role === "system" ? (
                    <div className="w-full text-center">
                      <span className="px-2 py-1 text-xs bg-muted rounded-md text-muted-foreground">
                        {message.content}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`flex items-start space-x-2 max-w-[80%] ${
                        message.role === "assistant" ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          message.role === "assistant" ? "bg-primary" : "bg-secondary"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <User className="w-4 h-4 text-primary-foreground" />
                        ) : (
                          <Bot className="w-4 h-4 text-secondary-foreground" />
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          message.role === "assistant"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {message.content}
                        <div className="mt-1 text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center border rounded-md">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Select a query from the list to view the conversation</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center space-x-2">
            <Input
              placeholder={selectedQuery ? "Type your response..." : "Select a query first"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || !selectedQuery || !selectedAPI}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={isLoading || !selectedQuery || !selectedAPI || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

