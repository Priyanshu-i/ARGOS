import type { Metadata } from "next"
import { ModelsList } from "@/components/models-list"

export const metadata: Metadata = {
  title: "Manage Models",
  description: "Configure and manage LLM models",
}

export default function ModelsPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-10">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Manage Models</h1>
        <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          Configure and manage LLM models for your APIs
        </p>
      </div>

      <ModelsList />
    </div>
  )
}

