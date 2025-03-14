"use client"

import { useState } from "react"
import { MessageSquare, MoreVertical, Power, PowerOff, Server, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for APIs
const mockCustomerAPIs = [
  {
    id: 1,
    name: "Customer API 1",
    type: "customer",
    status: "running",
    model: "smollm2:1.7b",
    endpoint: "/api/customer/1",
  },
  {
    id: 2,
    name: "Customer API 2",
    type: "customer",
    status: "running",
    model: "gpt-3.5-turbo",
    endpoint: "/api/customer/2",
  },
  { id: 3, name: "Customer API 3", type: "customer", status: "stopped", model: "llama2", endpoint: "/api/customer/3" },
  {
    id: 4,
    name: "Customer API 4",
    type: "customer",
    status: "running",
    model: "mistral-7b",
    endpoint: "/api/customer/4",
  },
]

const mockBackendAPIs = [
  {
    id: 5,
    name: "Backend API 1",
    type: "backend",
    status: "running",
    model: "smollm2:1.7b",
    endpoint: "/api/backend/1",
  },
  { id: 6, name: "Backend API 2", type: "backend", status: "stopped", model: "gpt-4", endpoint: "/api/backend/2" },
  { id: 7, name: "Backend API 3", type: "backend", status: "running", model: "claude-2", endpoint: "/api/backend/3" },
]

export function APIList() {
  const [customerAPIs, setCustomerAPIs] = useState(mockCustomerAPIs)
  const [backendAPIs, setBackendAPIs] = useState(mockBackendAPIs)

  const toggleAPIStatus = (type: string, id: number) => {
    if (type === "customer") {
      setCustomerAPIs(
        customerAPIs.map((api) =>
          api.id === id ? { ...api, status: api.status === "running" ? "stopped" : "running" } : api,
        ),
      )
    } else {
      setBackendAPIs(
        backendAPIs.map((api) =>
          api.id === id ? { ...api, status: api.status === "running" ? "stopped" : "running" } : api,
        ),
      )
    }
  }

  const deleteAPI = (type: string, id: number) => {
    if (type === "customer") {
      setCustomerAPIs(customerAPIs.filter((api) => api.id !== id))
    } else {
      setBackendAPIs(backendAPIs.filter((api) => api.id !== id))
    }
  }

  const renderAPICard = (api: any) => (
    <Card key={api.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {api.type === "customer" ? (
              <MessageSquare className="w-5 h-5 text-blue-500" />
            ) : (
              <Server className="w-5 h-5 text-purple-500" />
            )}
            <div>
              <div className="font-medium">{api.name}</div>
              <div className="text-sm text-muted-foreground">
                Model: {api.model} | Endpoint: {api.endpoint}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${api.status === "running" ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-xs text-muted-foreground">{api.status}</span>
            </div>
            <Switch checked={api.status === "running"} onCheckedChange={() => toggleAPIStatus(api.type, api.id)} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toggleAPIStatus(api.type, api.id)}>
                  {api.status === "running" ? (
                    <>
                      <PowerOff className="w-4 h-4 mr-2" />
                      Stop API
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4 mr-2" />
                      Start API
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteAPI(api.type, api.id)}>
                  <Trash className="w-4 h-4 mr-2" />
                  Delete API
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="customer" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="customer">Customer APIs</TabsTrigger>
        <TabsTrigger value="backend">Backend APIs</TabsTrigger>
      </TabsList>

      <TabsContent value="customer" className="mt-4">
        {customerAPIs.length > 0 ? (
          customerAPIs.map(renderAPICard)
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No customer APIs found. Create one to get started.
          </div>
        )}
      </TabsContent>

      <TabsContent value="backend" className="mt-4">
        {backendAPIs.length > 0 ? (
          backendAPIs.map(renderAPICard)
        ) : (
          <div className="p-8 text-center text-muted-foreground">No backend APIs found. Create one to get started.</div>
        )}
      </TabsContent>
    </Tabs>
  )
}

