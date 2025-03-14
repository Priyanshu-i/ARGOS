import type { ApiInstance, Query, QueryStatus } from "@/types"

// In a real implementation, this would connect to a database
// For this demo, we'll use in-memory storage

class DatabaseService {
  private apiInstances: ApiInstance[] = []
  private queries: Query[] = []

  // API Instance methods
  async saveApiInstance(apiInstance: ApiInstance): Promise<ApiInstance> {
    const existingIndex = this.apiInstances.findIndex((api) => api.id === apiInstance.id)

    if (existingIndex >= 0) {
      this.apiInstances[existingIndex] = {
        ...apiInstance,
        updatedAt: new Date(),
      }
      return this.apiInstances[existingIndex]
    } else {
      const newApiInstance = {
        ...apiInstance,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      this.apiInstances.push(newApiInstance)
      return newApiInstance
    }
  }

  async getApiInstance(id: string): Promise<ApiInstance | null> {
    const apiInstance = this.apiInstances.find((api) => api.id === id)
    return apiInstance || null
  }

  async getAllApiInstances(): Promise<ApiInstance[]> {
    return [...this.apiInstances]
  }

  async getApiInstancesByType(type: "CUSTOMER" | "BACKEND"): Promise<ApiInstance[]> {
    return this.apiInstances.filter((api) => api.type === type)
  }

  async deleteApiInstance(id: string): Promise<boolean> {
    const initialLength = this.apiInstances.length
    this.apiInstances = this.apiInstances.filter((api) => api.id !== id)
    return initialLength > this.apiInstances.length
  }

  // Query methods
  async saveQuery(query: Query): Promise<Query> {
    const existingIndex = this.queries.findIndex((q) => q.id === query.id)

    if (existingIndex >= 0) {
      this.queries[existingIndex] = {
        ...query,
        updatedAt: new Date(),
      }
      return this.queries[existingIndex]
    } else {
      const newQuery = {
        ...query,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      this.queries.push(newQuery)
      return newQuery
    }
  }

  async getQueryById(id: string): Promise<Query | null> {
    const query = this.queries.find((q) => q.id === id)
    return query || null
  }

  async getQueriesByStatus(status: QueryStatus): Promise<Query[]> {
    return this.queries.filter((q) => q.status === status)
  }

  async getQueriesByApiId(apiId: string): Promise<Query[]> {
    return this.queries.filter((q) => q.customerApiId === apiId)
  }

  // Initialize with some mock data
  initializeMockData() {
    // Mock API instances
    this.apiInstances = [
      {
        id: "1",
        name: "Customer API 1",
        type: "CUSTOMER",
        llmType: "ollama/smollm2:1.7b",
        isRunning: true,
        endpoint: "/api/customer/1",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60),
      },
      {
        id: "2",
        name: "Customer API 2",
        type: "CUSTOMER",
        llmType: "openai/gpt-3.5-turbo",
        isRunning: true,
        endpoint: "/api/customer/2",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: "3",
        name: "Customer API 3",
        type: "CUSTOMER",
        llmType: "ollama/llama2",
        isRunning: false,
        endpoint: "/api/customer/3",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        updatedAt: new Date(Date.now() - 1000 * 60 * 10),
      },
      {
        id: "4",
        name: "Customer API 4",
        type: "CUSTOMER",
        llmType: "ollama/mistral-7b",
        isRunning: true,
        endpoint: "/api/customer/4",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        updatedAt: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: "5",
        name: "Backend API 1",
        type: "BACKEND",
        llmType: "ollama/smollm2:1.7b",
        isRunning: true,
        endpoint: "/api/backend/1",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60),
      },
      {
        id: "6",
        name: "Backend API 2",
        type: "BACKEND",
        llmType: "openai/gpt-4",
        isRunning: false,
        endpoint: "/api/backend/2",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: "7",
        name: "Backend API 3",
        type: "BACKEND",
        llmType: "anthropic/claude-2",
        isRunning: true,
        endpoint: "/api/backend/3",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        updatedAt: new Date(Date.now() - 1000 * 60 * 10),
      },
    ]

    // Mock queries
    this.queries = [
      {
        id: "q1",
        customerApiId: "1",
        customerName: "John Doe",
        question: "How can I integrate your API with my React application?",
        customerResponse:
          "I don't have specific information about that yet. Let me check with our team and get back to you shortly.",
        internalNote:
          "Customer is asking about API integration with React. Need technical details about our REST API endpoints and authentication.",
        status: "PENDING_HUMAN",
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
        updatedAt: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: "q2",
        customerApiId: "1",
        customerName: "Jane Smith",
        question: "What's the difference between your Basic and Pro plans?",
        customerResponse:
          "I'm looking into this for you. The main differences are in the number of API calls allowed and the level of support provided.",
        internalNote:
          "Customer is asking about plan differences. Need updated pricing information and feature comparison.",
        status: "ANSWERED_BY_HUMAN",
        createdAt: new Date(Date.now() - 1000 * 60 * 15),
        updatedAt: new Date(Date.now() - 1000 * 60 * 10),
      },
      {
        id: "q3",
        customerApiId: "2",
        customerName: "Bob Johnson",
        question: "Do you offer any discounts for non-profit organizations?",
        customerResponse:
          "I don't have specific information about that yet. Let me check with our team and get back to you shortly.",
        internalNote: "Customer is asking about non-profit discounts. Need to check current policy with sales team.",
        status: "PENDING_HUMAN",
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30),
      },
    ]
  }
}

// Create and export a singleton instance
const dbService = new DatabaseService()
dbService.initializeMockData()

export default dbService

