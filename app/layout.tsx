import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import { Bot } from "lucide-react"

import { APIProvider } from "@/contexts/api-context"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Multi-API AI System",
  description: "A generalized system for managing local and remote LLMs with two-way communication",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <APIProvider>
            <div className="flex min-h-screen flex-col">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                  <Link href="/" className="flex items-center mr-4">
                    <Bot className="h-6 w-6 mr-2" />
                    <span className="font-bold">Multi-API AI System</span>
                  </Link>
                  <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
                    <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                      Dashboard
                    </Link>
                    <Link
                      href="/customer"
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      Customer Interface
                    </Link>
                    <Link
                      href="/backend"
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      Backend Interface
                    </Link>
                  </nav>
                </div>
              </header>
              <main className="flex-1">{children}</main>
              <footer className="border-t py-6">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
                  <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    Built with Next.js and the AI SDK
                  </p>
                </div>
              </footer>
            </div>
          </APIProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'