"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MessageSquare, Send, Bot, User, TrendingUp, AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  toolResults?: any[]
}

interface LiquidityAgentProps {
  onDeployRequest?: (poolId: string, baseAmount?: number, quoteAmount?: number, slippage?: number) => void
}

export function LiquidityAgent({ onDeployRequest }: LiquidityAgentProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm DOS-LIQUID, your AI liquidity strategist. I can help you:\n\n• Analyze pool performance and risks\n• Recommend optimal allocations\n• Explain impermanent loss\n• Deploy liquidity with smart parameters\n\nWhat would you like to know about DEUS liquidity strategies?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Check for deploy modal action in tool results
      if (data.toolResults) {
        for (const result of data.toolResults) {
          if (result.result?.action === "OPEN_DEPLOY_MODAL") {
            const { poolId, baseAmount, quoteAmount, slippage } = result.result
            onDeployRequest?.(poolId, baseAmount, quoteAmount, slippage)
            toast({
              title: "Success",
              description: "Opening deploy modal with AI recommendations",
            })
          }
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        toolResults: data.toolResults,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      })

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try your question again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickPrompt = async (prompt: string) => {
    if (isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Check for deploy modal action in tool results
      if (data.toolResults) {
        for (const result of data.toolResults) {
          if (result.result?.action === "OPEN_DEPLOY_MODAL") {
            const { poolId, baseAmount, quoteAmount, slippage } = result.result
            onDeployRequest?.(poolId, baseAmount, quoteAmount, slippage)
            toast({
              title: "Success",
              description: "Opening deploy modal with AI recommendations",
            })
          }
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        toolResults: data.toolResults,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      })

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try your question again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatToolResult = (toolResult: any) => {
    if (!toolResult?.result) return null

    const { result } = toolResult

    if (result.pools) {
      return (
        <Card className="mt-2 glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pool Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.pools.map((pool: any, index: number) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium">
                    {pool.baseToken}/{pool.quoteToken}
                  </span>
                  <Badge variant={pool.isDeusPool ? "default" : "secondary"} className="ml-2 text-xs">
                    {pool.isDeusPool ? "DEUS" : "V3"}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-accent font-medium">{pool.netApy.toFixed(1)}% APY</div>
                  <div className="text-xs text-muted-foreground">{pool.liquidityFormatted} TVL</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )
    }

    if (result.allocations) {
      return (
        <Card className="mt-2 glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-accent" />
              Allocation Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Expected Weighted APY:</span>
              <span className="ml-2 font-bold text-accent">{result.expectedWeightedApy}%</span>
            </div>
            <Separator />
            {result.allocations.map((allocation: any, index: number) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium">{allocation.poolId}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {allocation.percentage}%
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-medium">${allocation.amount.toLocaleString()}</div>
                  <div className="text-xs text-accent">{allocation.netApy.toFixed(1)}% APY</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )
    }

    if (result.impermanentLoss) {
      return (
        <Card className="mt-2 glass-card border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center text-yellow-400">
              <AlertTriangle className="h-4 w-4 mr-2" />
              IL Simulation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Price Change:</span>
                <span className="font-medium">{result.priceChange}</span>
              </div>
              <div className="flex justify-between">
                <span>Impermanent Loss:</span>
                <span className="font-medium text-yellow-400">{result.impermanentLoss}</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{result.recommendation}</div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return null
  }

  const quickPrompts = [
    "Analyze DEUS pools performance",
    "Recommend allocation for $10k conservative",
    "Explain impermanent loss risks",
    "Best pools for high APY",
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-20 right-6 md:bottom-6 h-14 w-14 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 neon-glow shadow-lg z-[60]">
          <MessageSquare className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-[480px] glass-card border-l border-border/40 p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 flex-shrink-0">
          <SheetTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-accent" />
            <span>DOS-LIQUID AI Agent</span>
          </SheetTitle>
          <SheetDescription>Your intelligent liquidity strategy advisor</SheetDescription>
        </SheetHeader>

        {/* Messages - scrollable area */}
        <div className="flex-1 overflow-y-auto px-6" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === "assistant"
                      ? "bg-accent text-accent-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  </div>

                  {message.toolResults?.map((toolResult, index) => (
                    <div key={index}>{formatToolResult(toolResult)}</div>
                  ))}

                  <div className="text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>DOS-LIQUID is thinking...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Prompts - fixed at bottom of messages */}
        {messages.length === 1 && (
          <div className="px-6 py-2 flex-shrink-0">
            <div className="text-xs text-muted-foreground mb-2">Quick prompts:</div>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-transparent"
                  onClick={() => handleQuickPrompt(prompt)}
                  disabled={isLoading}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input - fixed at bottom */}
        <div className="p-6 pt-4 border-t border-border/40 flex-shrink-0">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about liquidity strategies..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
