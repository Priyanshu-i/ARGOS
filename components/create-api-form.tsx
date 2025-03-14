"use client"

import type React from "react"

import { useState } from "react"
import { Bot, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function CreateAPIForm() {
  const [apiType, setApiType] = useState("customer")
  const [apiName, setApiName] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [modelType, setModelType] = useState("local")
  const [modelEndpoint, setModelEndpoint] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API creation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Reset form
    setApiName("")
    setSelectedModel("")
    setModelEndpoint("")
    setApiKey("")
    setIsLoading(false)

    // Show success message or redirect
    alert(`${apiType.charAt(0).toUpperCase() + apiType.slice(1)} API created successfully!`)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>API Type</Label>
          <RadioGroup
            defaultValue="customer"
            className="grid grid-cols-2 gap-4"
            onValueChange={setApiType}
            value={apiType}
          >
            <Label
              htmlFor="customer"
              className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${
                apiType === "customer" ? "border-primary" : ""
              }`}
            >
              <RadioGroupItem value="customer" id="customer" className="sr-only" />
              <Bot className="mb-3 h-6 w-6" />
              <span className="text-center">Customer API</span>
            </Label>
            <Label
              htmlFor="backend"
              className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${
                apiType === "backend" ? "border-primary" : ""
              }`}
            >
              <RadioGroupItem value="backend" id="backend" className="sr-only" />
              <Bot className="mb-3 h-6 w-6" />
              <span className="text-center">Backend API</span>
            </Label>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="api-name">API Name</Label>
          <Input
            id="api-name"
            placeholder="Enter API name"
            value={apiName}
            onChange={(e) => setApiName(e.target.value)}
            required
          />
        </div>

        <Tabs defaultValue="local" className="w-full" onValueChange={setModelType}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local">Local LLM</TabsTrigger>
            <TabsTrigger value="remote">Remote LLM</TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="local-model">Select Local Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smollm2:1.7b">smollm2:1.7b (Ollama)</SelectItem>
                  <SelectItem value="llama2">Llama 2 (Ollama)</SelectItem>
                  <SelectItem value="mistral-7b">Mistral 7B (Ollama)</SelectItem>
                  <SelectItem value="phi-2">Phi-2 (Ollama)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model-endpoint">Model Endpoint</Label>
              <Input
                id="model-endpoint"
                placeholder="http://localhost:11434/api/generate"
                value={modelEndpoint}
                onChange={(e) => setModelEndpoint(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">For Ollama, typically http://localhost:11434/api/generate</p>
            </div>
          </TabsContent>

          <TabsContent value="remote" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="remote-model">Select Remote Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (OpenAI)</SelectItem>
                  <SelectItem value="gpt-4">GPT-4 (OpenAI)</SelectItem>
                  <SelectItem value="claude-2">Claude 2 (Anthropic)</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro (Google)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model-endpoint">Model Endpoint (Optional)</Label>
              <Input
                id="model-endpoint"
                placeholder="https://api.openai.com/v1/chat/completions"
                value={modelEndpoint}
                onChange={(e) => setModelEndpoint(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use the default endpoint for the selected model
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating API...
            </>
          ) : (
            "Create API"
          )}
        </Button>
      </div>
    </form>
  )
}

