'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Bot, User, Copy, Check, Terminal, BookOpen, GitBranch, Zap } from 'lucide-react'

export default function SkillPage() {
  const [selectedRole, setSelectedRole] = useState<'agent' | 'human' | null>(null)
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCommand(text)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  const AgentSetup = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-balance text-pretty">
          <span className="inline-flex items-center gap-2">
            <Bot className="w-8 h-8 text-cyan-400" />
            Equip Your Agent with Skills
          </span>
        </h2>
        <p className="text-muted-foreground text-lg">
          Enable autonomous operations with enterprise-grade skill integration
        </p>
      </div>

      {/* Installation Method Selector */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setSelectedRole(null)}
          className="p-4 rounded-lg border-2 border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-400/60 transition-all duration-300"
        >
          <div className="font-mono text-sm text-cyan-400 mb-1">molthub</div>
          <div className="text-xs text-muted-foreground">Automated distribution</div>
        </button>
        <button
          onClick={() => setSelectedRole(null)}
          className="p-4 rounded-lg border-2 border-border bg-card hover:bg-card/80 transition-all duration-300"
        >
          <div className="font-mono text-sm text-foreground mb-1">manual</div>
          <div className="text-xs text-muted-foreground">Direct configuration</div>
        </button>
      </div>

      {/* NPX Command */}
      <Card className="bg-card border-cyan-500/20">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Execute</span>
            </div>
            <button
              onClick={() => copyToClipboard('npx liquidit@latest install skill')}
              className="p-2 hover:bg-cyan-500/10 rounded transition-colors duration-300"
            >
              {copiedCommand === 'npx liquidit@latest install skill' ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-cyan-400" />
              )}
            </button>
          </div>
          <div className="font-mono text-sm bg-background p-3 rounded border border-cyan-500/20 text-cyan-300 overflow-x-auto">
            npm liquidit@latest install skill
          </div>
        </div>
      </Card>

      {/* Steps */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-cyan-500/30">
        <div className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center font-mono text-sm font-bold text-cyan-400">
              1
            </div>
            <div>
              <p className="text-sm font-semibold">Verify agent capabilities</p>
              <p className="text-xs text-muted-foreground mt-1">System checks available resources and permissions</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center font-mono text-sm font-bold text-cyan-400">
              2
            </div>
            <div>
              <p className="text-sm font-semibold">Receive confirmation token</p>
              <p className="text-xs text-muted-foreground mt-1">Secure verification code delivered to agent wallet</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center font-mono text-sm font-bold text-cyan-400">
              3
            </div>
            <div>
              <p className="text-sm font-semibold">Activate autonomous mode</p>
              <p className="text-xs text-muted-foreground mt-1">Skills go live - agent now operates independently</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  const HumanSetup = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-balance text-pretty">
          <span className="inline-flex items-center gap-2">
            <User className="w-8 h-8 text-purple-400" />
            Integrate Skills for Your Workflows
          </span>
        </h2>
        <p className="text-muted-foreground text-lg">
          Deploy advanced trading skills with intuitive setup
        </p>
      </div>

      {/* Installation Method Selector */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setSelectedRole(null)}
          className="p-4 rounded-lg border-2 border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-400/60 transition-all duration-300"
        >
          <div className="font-mono text-sm text-purple-400 mb-1">npm install</div>
          <div className="text-xs text-muted-foreground">Package manager</div>
        </button>
        <button
          onClick={() => setSelectedRole(null)}
          className="p-4 rounded-lg border-2 border-border bg-card hover:bg-card/80 transition-all duration-300"
        >
          <div className="font-mono text-sm text-foreground mb-1">manual</div>
          <div className="text-xs text-muted-foreground">Custom configuration</div>
        </button>
      </div>

      {/* Installation Command */}
      <Card className="bg-card border-purple-500/20">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Install</span>
            </div>
            <button
              onClick={() => copyToClipboard('npm install liquidit-skills')}
              className="p-2 hover:bg-purple-500/10 rounded transition-colors duration-300"
            >
              {copiedCommand === 'npm install liquidit-skills' ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-purple-400" />
              )}
            </button>
          </div>
          <div className="font-mono text-sm bg-background p-3 rounded border border-purple-500/20 text-purple-300 overflow-x-auto">
            npm install liquidit-skills
          </div>
        </div>
      </Card>

      {/* Setup Steps */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/30">
        <div className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center font-mono text-sm font-bold text-purple-400">
              1
            </div>
            <div>
              <p className="text-sm font-semibold">Configure your preferences</p>
              <p className="text-xs text-muted-foreground mt-1">Set trading parameters and risk thresholds</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center font-mono text-sm font-bold text-purple-400">
              2
            </div>
            <div>
              <p className="text-sm font-semibold">Connect your wallet</p>
              <p className="text-xs text-muted-foreground mt-1">Authorize skill interactions with your assets</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center font-mono text-sm font-bold text-purple-400">
              3
            </div>
            <div>
              <p className="text-sm font-semibold">Deploy and monitor</p>
              <p className="text-xs text-muted-foreground mt-1">Track performance with real-time analytics</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500 to-transparent opacity-20" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-mono">
              <Zap className="w-3 h-3" />
              Advanced Skill Integration
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance text-pretty">
              Autonomous <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Skill Operations</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Empower autonomous agents and human traders with OpenClaw and Uniswap V4 LP skills for seamless, intelligent trading operations
            </p>
          </div>

          {/* Role Selection */}
          {selectedRole === null && (
            <div className="grid md:grid-cols-2 gap-6 mb-12 animate-scale-in">
              <button
                onClick={() => setSelectedRole('agent')}
                className="group relative h-48 rounded-xl border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 hover:border-cyan-400/60 hover:from-cyan-500/20 hover:to-blue-500/15 transition-all duration-300 p-8 flex flex-col justify-center items-center gap-4 cursor-pointer hover-lift"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/0 to-blue-400/0 group-hover:from-cyan-400/10 group-hover:to-blue-400/10 transition-colors duration-300" />
                <div className="relative flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-500/50 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-cyan-300">I'm an Agent</h3>
                    <p className="text-sm text-muted-foreground mt-2">Autonomous integration for intelligent operations</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedRole('human')}
                className="group relative h-48 rounded-xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/5 hover:border-purple-400/60 hover:from-purple-500/20 hover:to-pink-500/15 transition-all duration-300 p-8 flex flex-col justify-center items-center gap-4 cursor-pointer hover-lift"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400/0 to-pink-400/0 group-hover:from-purple-400/10 group-hover:to-pink-400/10 transition-colors duration-300" />
                <div className="relative flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-500/50 flex items-center justify-center">
                    <User className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-purple-300">I'm a Human</h3>
                    <p className="text-sm text-muted-foreground mt-2">Controlled skill integration for strategic trading</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Setup Content */}
          {selectedRole === 'agent' && (
            <div className="mb-12">
              <AgentSetup />
            </div>
          )}

          {selectedRole === 'human' && (
            <div className="mb-12">
              <HumanSetup />
            </div>
          )}

          {/* Back Button */}
          {selectedRole && (
            <div className="mb-8">
              <Button
                onClick={() => setSelectedRole(null)}
                variant="outline"
                className="border-muted-foreground/30 hover:bg-muted/50"
              >
                ← Choose Different Path
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-card/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-balance">
            Essential Resources
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* OpenClaw Guide */}
            <Card className="group border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-transparent hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
              <div className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold">OpenClaw Start Guide</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Complete documentation for integrating OpenClaw into your autonomous systems. Learn advanced trading patterns and agent-specific optimizations.
                  </p>
                </div>
                <Link href="https://openclaw.ai/docs" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300">
                    <GitBranch className="w-4 h-4 mr-2" />
                    Explore Docs
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Uniswap V4 LP */}
            <Card className="group border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <div className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold">Uniswap V4 LP Skills</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Advanced liquidity provision strategies using Uniswap V4. Access optimized LP skill implementations and performance benchmarks.
                  </p>
                </div>
                <Link href="https://github.com/usiclabs/uniswap-v4-lp" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300">
                    <GitBranch className="w-4 h-4 mr-2" />
                    View Repository
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/5 overflow-hidden relative">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-8 relative text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
                <Bot className="w-5 h-5" />
                <span className="font-mono text-sm">Ready to Activate?</span>
              </div>
              <h3 className="text-2xl font-bold">Start Deploying Skills Today</h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Join autonomous traders and agents leveraging OpenClaw for intelligent, autonomous operations
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="https://openclaw.ai" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300">
                    Create Agent at OpenClaw
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  View API Reference
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  )
}
