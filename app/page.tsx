import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Bot, MessageSquare, Server } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { APIList } from "@/components/api-list"
import { CreateAPIForm } from "@/components/create-api-form"

export const metadata: Metadata = {
  title: "ARGOS | Augmented, Reliable Guidance & Omniscient System",
  description: "A generalized system for managing local and remote LLMs with two-way communication",
}

export default function HomePage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-10 space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Multi-API AI System</h1>
        <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          A generalized system for managing local and remote LLMs with two-way communication
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full max-w-4xl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="create">Create API</TabsTrigger>
          <TabsTrigger value="manage">Manage APIs</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Customer APIs</CardTitle>
                <CardDescription>APIs for end-user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">8 active, 4 inactive</p>
              </CardContent>
              <CardFooter>
                <Link href="/customer" className="w-full">
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Customer Interface
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Backend APIs</CardTitle>
                <CardDescription>APIs for employee communications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">5 active, 3 inactive</p>
              </CardContent>
              <CardFooter>
                <Link href="/backend" className="w-full">
                  <Button variant="outline" className="w-full">
                    <Server className="w-4 h-4 mr-2" />
                    View Backend Interface
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">LLM Models</CardTitle>
                <CardDescription>Connected AI models</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Local: 2, Remote: 3</p>
              </CardContent>
              <CardFooter>
                <Link href="/models" className="w-full">
                  <Button variant="outline" className="w-full">
                    <Bot className="w-4 h-4 mr-2" />
                    Manage Models
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest interactions across all APIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? "bg-green-500" : "bg-amber-500"}`} />
                      <span className="font-medium">API-{i}</span>
                      <span className="text-sm text-muted-foreground">
                        {i % 2 === 0 ? "Customer query resolved" : "Awaiting employee response"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{i * 5} min ago</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New API</CardTitle>
              <CardDescription>Set up a new customer-facing or backend communication API</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateAPIForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Manage APIs</CardTitle>
              <CardDescription>View and control all created APIs</CardDescription>
            </CardHeader>
            <CardContent>
              <APIList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

