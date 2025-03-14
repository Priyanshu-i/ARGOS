import type { Metadata } from "next"
import { CustomerInterface } from "@/components/customer-interface"

export const metadata: Metadata = {
  title: "Customer Interface",
  description: "Interact with the AI as a customer",
}

export default function CustomerPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-10">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Customer Interface</h1>
        <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          Interact with the AI as a customer
        </p>
      </div>

      <CustomerInterface />
    </div>
  )
}

