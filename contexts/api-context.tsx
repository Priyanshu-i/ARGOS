"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { ApiInstance, ApiType } from "@/types"

// Context type
type APIContextType = {
  apis: ApiInstance[]
  createAPI: (api: { name: string; type: ApiType; llmType: string }) => Promise<ApiInstance>
  updateAPI: (id: string, updates: Partial<ApiInstance>) => Promise<ApiInstance>
  deleteAPI: (id: string) => Promise<boolean>
  toggleAPIStatus: (id: string) => Promise<ApiInstance>
  isLoading: boolean
  error: string | null
}

// Create context
const APIContext = createContext<APIContextType | undefined>(undefined)

// Provider component
export function APIProvider({ children }: { children: ReactNode }) {
  const [apis, setApis] = useState<ApiInstance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch APIs on mount
  useEffect(() => {
    const fetchApis = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/management")

        if (!response.ok) {
          throw new Error("Failed to fetch APIs")
        }

        const data = await response.json()
        setApis(data.apis)
      } catch (err) {
        console.error("Error fetching APIs:", err)
        setError("Failed to fetch APIs")
      } finally {
        setIsLoading(false)
      }
    }

    fetchApis()
  }, [])

  // Create a new API
  const createAPI = async (apiData: { name: string; type: ApiType; llmType: string }) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/management", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        throw new Error("Failed to create API")
      }

      const data = await response.json()
      const newAPI = data.api

      setApis((prev) => [...prev, newAPI])
      return newAPI
    } catch (err) {
      console.error("Error creating API:", err)
      setError("Failed to create API")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Update an existing API
  const updateAPI = async (id: string, updates: Partial<ApiInstance>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/management/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update API")
      }

      const data = await response.json()
      const updatedAPI = data.api

      setApis((prev) => prev.map((api) => (api.id === id ? updatedAPI : api)))
      return updatedAPI
    } catch (err) {
      console.error("Error updating API:", err)
      setError("Failed to update API")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Delete an API
  const deleteAPI = async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/management/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete API")
      }

      setApis((prev) => prev.filter((api) => api.id !== id))
      return true
    } catch (err) {
      console.error("Error deleting API:", err)
      setError("Failed to delete API")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle API status (running/stopped)
  const toggleAPIStatus = async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const api = apis.find((api) => api.id === id)

      if (!api) {
        throw new Error("API not found")
      }

      const response = await fetch(`/api/management/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isRunning: !api.isRunning,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle API status")
      }

      const data = await response.json()
      const updatedAPI = data.api

      setApis((prev) => prev.map((api) => (api.id === id ? updatedAPI : api)))
      return updatedAPI
    } catch (err) {
      console.error("Error toggling API status:", err)
      setError("Failed to toggle API status")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <APIContext.Provider
      value={{
        apis,
        createAPI,
        updateAPI,
        deleteAPI,
        toggleAPIStatus,
        isLoading,
        error,
      }}
    >
      {children}
    </APIContext.Provider>
  )
}

// Hook for using the API context
export function useAPI() {
  const context = useContext(APIContext)
  if (context === undefined) {
    throw new Error("useAPI must be used within an APIProvider")
  }
  return context
}

