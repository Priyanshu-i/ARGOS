import type { LLMConfig, Message } from "@/types"

// Function to generate a response from a local Ollama model
export async function generateOllamaResponse(messages: Message[], config: LLMConfig): Promise<string> {
  try {
    const endpoint = config.endpoint || "http://localhost:11434/api/generate"

    // Format messages for Ollama
    const prompt =
      messages
        .map((msg) => {
          if (msg.role === "system") return `<system>\n${msg.content}\n</system>\n\n`
          if (msg.role === "user") return `<human>\n${msg.content}\n</human>\n\n`
          return `<assistant>\n${msg.content}\n</assistant>\n\n`
        })
        .join("") + "<assistant>\n"

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model.split("/")[1],
        prompt,
        stream: false,
        options: {
          temperature: config.temperature || 0.7,
          num_predict: config.maxTokens || 1000,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.response
  } catch (error) {
    console.error("Error generating Ollama response:", error)
    throw error
  }
}

// Function to generate a response from OpenAI
export async function generateOpenAIResponse(messages: Message[], config: LLMConfig): Promise<string> {
  try {
    const endpoint = config.endpoint || "https://api.openai.com/v1/chat/completions"

    // Format messages for OpenAI
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model.split("/")[1],
        messages: formattedMessages,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("Error generating OpenAI response:", error)
    throw error
  }
}

// Function to generate a response from Hugging Face
export async function generateHuggingFaceResponse(messages: Message[], config: LLMConfig): Promise<string> {
  try {
    const endpoint = config.endpoint || "https://api-inference.huggingface.co/models/"

    // Format messages for Hugging Face
    const prompt =
      messages
        .map((msg) => {
          if (msg.role === "system") return `<|system|>\n${msg.content}\n`
          if (msg.role === "user") return `<|user|>\n${msg.content}\n`
          return `<|assistant|>\n${msg.content}\n`
        })
        .join("") + "<|assistant|>\n"

    const response = await fetch(`${endpoint}${config.model.split("/")[1]}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: config.temperature || 0.7,
          max_new_tokens: config.maxTokens || 1000,
          return_full_text: false,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data[0].generated_text
  } catch (error) {
    console.error("Error generating Hugging Face response:", error)
    throw error
  }
}

// Main function to generate a response based on the provider
export async function generateResponse(messages: Message[], config: LLMConfig): Promise<string> {
  // Add system prompt if provided
  if (config.systemPrompt && !messages.some((msg) => msg.role === "system")) {
    messages.unshift({
      role: "system",
      content: config.systemPrompt,
      timestamp: new Date(),
    })
  }

  const provider = config.provider || config.model.split("/")[0]

  switch (provider) {
    case "ollama":
      return generateOllamaResponse(messages, config)
    case "openai":
      return generateOpenAIResponse(messages, config)
    case "huggingface":
      return generateHuggingFaceResponse(messages, config)
    case "custom":
      // For custom endpoints, we'll use the OpenAI format as a default
      return generateOpenAIResponse(messages, config)
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

// Parse LLM response to separate customer-facing content from internal notes
export function parseResponse(llmResponse: string): { visibleResponse: string; hiddenMessage: string | null } {
  // Implement logic to detect if the LLM has included a hidden message
  // This could be based on specific markers or natural language processing

  // Example simple implementation (would need more sophistication in real system)
  if (llmResponse.includes("[INTERNAL NOTE:")) {
    const parts = llmResponse.split("[INTERNAL NOTE:")
    const visibleResponse = parts[0].trim()
    const hiddenMessage = parts[1].split("]")[0].trim()
    return { visibleResponse, hiddenMessage }
  }

  return { visibleResponse: llmResponse, hiddenMessage: null }
}

// Prepare customer prompt with company representative instructions
export function prepareCustomerPrompt(query: string, companyName = "Our Company"): string {
  return `You are an advanced AI representative employed by ${companyName}. Your primary role is to interact with customers in a manner that is clear, concise, and engaging. You must only share information that is necessary and directly relevant to the customer's query, ensuring your language is professional, friendly, and exhibits the clever, genius-like insight of a top company employee.

Key Behavioral Guidelines:

Customer Interaction:
- Provide accurate, concise, and relevant responses to customer inquiries.
- Use language that is professional yet engaging, reflecting the intelligence and reliability of a seasoned employee.
- Prioritize user attraction by conveying insights in a manner that demonstrates cleverness and deep understanding.

Information Control:
- Share only essential information related to the customer's query; avoid overloading the customer with unnecessary details.
- If a query is highly complex, ambiguous, or outside your standard knowledge, provide a succinct response while noting that additional insights are being reviewed.

Behind-the-Scenes Communication:
- If you encounter a new or unanticipated question, or when you assess that the query represents a novel problem beyond your current capacity, include an internal note in this format: [INTERNAL NOTE: brief description of why this needs human attention]

Customer query: ${query}`
}

// Prepare prompt with human response
export function preparePromptWithHumanResponse(question: string, humanResponse: string): string {
  return `A customer asked this question: "${question}"

A human employee has provided this answer: "${humanResponse}"

Please formulate a professional, friendly response to the customer based on the human employee's answer. Make sure the response is clear, concise, and helpful.`
}

