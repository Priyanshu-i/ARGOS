import type { Metadata } from "next"
import { BackendInterface } from "@/components/backend-interface"

export const metadata: Metadata = {
  title: "Backend Interface",
  description: "Respond to customer queries as an employee",
}

export default function BackendPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-10">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Backend Interface</h1>
        <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          Respond to customer queries as an employee
        </p>
      </div>

      <BackendInterface />
    </div>
  )
}

