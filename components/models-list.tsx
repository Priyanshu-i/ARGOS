"use client"

import { useState } from "react"
import { Bot, Download, MoreVertical, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

// Mock data for models
const mockLocalModels = [
  { id: 1, name: "smollm2:1.7b", provider: "ollama", size: "1.7 GB", status: "downloaded" },
  { id: 2, name: "llama2", provider: "ollama", size: "7 GB", status: "downloaded" },
  { id: 3, name: "mistral-7b", provider: "ollama", size: "4.1 GB", status: "downloaded" },
  { id: 4, name: "phi-2", provider: "ollama", size: "2.7 GB", status: "downloading", progress: 65 },
]

const mockRemoteModels = [
  { id: 5, name: "gpt-3.5-turbo", provider: "openai", status: "configured" },
  { id: 6, name: "gpt-4", provider: "openai", status: "configured" },
  { id: 7, name: "claude-2", provider: "anthropic", status: "configured" },
]

export function ModelsList() {
  const [localModels, setLocalModels] = useState(mockLocalModels)
  const [remoteModels, setRemoteModels] = useState(mockRemoteModels)
  const [newModelName, setNewModelName] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadModel = async () => {
    if (!newModelName.trim()) return

    setIsDownloading(true)

    // Simulate download
    const newModel = {
      id: localModels.length + 1,
      name: newModelName,
      provider: "ollama",
      size: "Unknown",
      status: "downloading",
      progress: 0,
    }

    setLocalModels((prev) => [...prev, newModel])
    setNewModelName("")

    // Simulate progress updates
    let progress = 0
    const interval = setInterval(() => {
      progress += 10

      if (progress <= 100) {
        setLocalModels((prev) =>
          prev.map((model) =>
            model.name === newModelName
              ? { ...model, progress, status: progress === 100 ? "downloaded" : "downloading" }
              : model,
          ),
        )
      } else {
        clearInterval(interval)
        setIsDownloading(false)
      }
    }, 1000)
  }

  const handleDeleteModel = (id: number, type: "local" | "remote") => {
    if (type === "local") {
      setLocalModels((prev) => prev.filter((model) => model.id !== id))
    } else {
      setRemoteModels((prev) => prev.filter((model) => model.id !== id))
    }
  }

  return (
    <div className="w-full max-w-4xl">
      <Tabs defaultValue="local" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="local">Local Models</TabsTrigger>
          <TabsTrigger value="remote">Remote Models</TabsTrigger>
        </TabsList>

        <TabsContent value="local" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Download New Model</CardTitle>
              <CardDescription>Download a new model from Ollama</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-2">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="model-name">Model Name</Label>
                  <Input
                    id="model-name"
                    placeholder="e.g., llama2, mistral-7b"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    disabled={isDownloading}
                  />
                </div>
                <Button onClick={handleDownloadModel} disabled={isDownloading || !newModelName.trim()}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {localModels.map((model) => (
              <Card key={model.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{model.name}</CardTitle>
                      <CardDescription>
                        Provider: {model.provider} | Size: {model.size}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteModel(model.id, "local")}>
                          <Trash className="w-4 h-4 mr-2" />
                          Delete Model
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {model.status === "downloading" && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Downloading...</span>
                        <span>{model.progress}%</span>
                      </div>
                      <Progress value={model.progress} />
                    </div>
                  )}
                  {model.status === "downloaded" && (
                    <div className="flex items-center text-sm text-green-600">
                      <Bot className="w-4 h-4 mr-1" />
                      Ready to use
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="remote" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configure Remote Model</CardTitle>
              <CardDescription>Set up access to a remote LLM provider</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="provider">Provider</Label>
                    <select
                      id="provider"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="google">Google</option>
                      <option value="huggingface">Hugging Face</option>
                    </select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="model">Model</Label>
                    <select
                      id="model"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="gpt-4">GPT-4</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input id="api-key" type="password" placeholder="Enter your API key" />
                </div>
                <Button className="w-full">Configure Model</Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {remoteModels.map((model) => (
              <Card key={model.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{model.name}</CardTitle>
                      <CardDescription>Provider: {model.provider}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteModel(model.id, "remote")}>
                          <Trash className="w-4 h-4 mr-2" />
                          Remove Configuration
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-green-600">
                    <Bot className="w-4 h-4 mr-1" />
                    Configured and ready to use
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

