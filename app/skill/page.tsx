'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Bot, User, Copy, Check, Terminal, BookOpen, GitBranch, Zap, Target, RefreshCw, TrendingUp, Flame, LayoutGrid } from 'lucide-react'
import { StickyHeader } from '@/components/sticky-header'
import { DeusTicker } from '@/components/deus-ticker'
import { ErrorBoundary } from '@/components/error-boundary'
import { V4LPAgentControls } from '@/components/v4-lp-agent-controls'
import { motion } from 'framer-motion'

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
            <Bot className="w-8 h-8 text-accent-foreground" />
            Equip Your Agent with Skills
          </span>
        </h2>
        <p className="text-gray-400 text-lg">
          Enable autonomous operations with enterprise-grade skill integration
        </p>
      </div>

      {/* Installation Method Selector */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setSelectedRole(null)}
          className="p-4 rounded-lg border-2 border-accent/30 bg-accent/5 hover:bg-accent/10 hover:border-accent/60 transition-all duration-300"
        >
          <div className="font-mono text-sm text-accent-foreground mb-1">molthub</div>
          <div className="text-xs text-gray-400">Automated distribution</div>
        </button>
        <button
          onClick={() => setSelectedRole(null)}
          className="p-4 rounded-lg border-2 border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
        >
          <div className="font-mono text-sm text-white mb-1">manual</div>
          <div className="text-xs text-gray-400">Direct configuration</div>
        </button>
      </div>

      {/* NPX Command */}
      <Card className="glass-card border-accent/20">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent-foreground" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">Execute</span>
            </div>
            <button
              onClick={() => copyToClipboard('npx liquidit@latest install skill')}
              className="p-2 hover:bg-accent/10 rounded transition-colors duration-300"
            >
              {copiedCommand === 'npx liquidit@latest install skill' ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-accent-foreground" />
              )}
            </button>
          </div>
          <div className="font-mono text-sm bg-black/40 p-3 rounded border border-accent/20 text-accent-foreground overflow-x-auto">
            npm liquidit@latest install skill
          </div>
        </div>
      </Card>

      {/* Steps */}
      <Card className="glass-card bg-gradient-to-br from-accent/10 to-orange-500/5 border-accent/30">
        <div className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center font-mono text-sm font-bold text-accent-foreground">
              1
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Verify agent capabilities</p>
              <p className="text-xs text-gray-400 mt-1">System checks available resources and permissions</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center font-mono text-sm font-bold text-accent-foreground">
              2
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Receive confirmation token</p>
              <p className="text-xs text-gray-400 mt-1">Secure verification code delivered to agent wallet</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center font-mono text-sm font-bold text-accent-foreground">
              3
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Activate autonomous mode</p>
              <p className="text-xs text-gray-400 mt-1">Skills go live - agent now operates independently</p>
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
            <User className="w-8 h-8 text-accent-foreground" />
            Integrate Skills for Your Workflows
          </span>
        </h2>
        <p className="text-gray-400 text-lg">
          Deploy advanced trading skills with intuitive setup
        </p>
      </div>

      {/* Installation Method Selector */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setSelectedRole(null)}
          className="p-4 rounded-lg border-2 border-accent/30 bg-accent/5 hover:bg-accent/10 hover:border-accent/60 transition-all duration-300"
        >
          <div className="font-mono text-sm text-accent-foreground mb-1">npm install</div>
          <div className="text-xs text-gray-400">Package manager</div>
        </button>
        <button
          onClick={() => setSelectedRole(null)}
          className="p-4 rounded-lg border-2 border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
        >
          <div className="font-mono text-sm text-white mb-1">manual</div>
          <div className="text-xs text-gray-400">Custom configuration</div>
        </button>
      </div>

      {/* Installation Command */}
      <Card className="glass-card border-accent/20">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent-foreground" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">Install</span>
            </div>
            <button
              onClick={() => copyToClipboard('npm install liquidit-skills')}
              className="p-2 hover:bg-accent/10 rounded transition-colors duration-300"
            >
              {copiedCommand === 'npm install liquidit-skills' ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-accent-foreground" />
              )}
            </button>
          </div>
          <div className="font-mono text-sm bg-black/40 p-3 rounded border border-accent/20 text-accent-foreground overflow-x-auto">
            npm install liquidit-skills
          </div>
        </div>
      </Card>

      {/* Setup Steps */}
      <Card className="glass-card bg-gradient-to-br from-accent/10 to-orange-500/5 border-accent/30">
        <div className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center font-mono text-sm font-bold text-accent-foreground">
              1
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Configure your preferences</p>
              <p className="text-xs text-gray-400 mt-1">Set trading parameters and risk thresholds</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center font-mono text-sm font-bold text-accent-foreground">
              2
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Connect your wallet</p>
              <p className="text-xs text-gray-400 mt-1">Authorize skill interactions with your assets</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center font-mono text-sm font-bold text-accent-foreground">
              3
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Deploy and monitor</p>
              <p className="text-xs text-gray-400 mt-1">Track performance with real-time analytics</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  return (
    <main className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-accent to-transparent opacity-20" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-accent/30 text-accent-foreground text-sm font-mono">
              <Zap className="w-3 h-3" />
              Advanced Skill Integration
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance text-pretty">
              Autonomous <span className="bg-gradient-to-r from-amber-200 via-orange-400 to-red-400 bg-clip-text text-transparent">Skill Operations</span>
            </h1>

            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Empower autonomous agents and human traders with OpenClaw and Uniswap V4 LP skills for seamless, intelligent trading operations
            </p>
          </motion.div>

          {/* Role Selection */}
          {selectedRole === null && (
            <div className="grid md:grid-cols-2 gap-6 mb-12 animate-scale-in">
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole('agent')}
                className="group relative h-48 rounded-xl border-2 border-accent/30 bg-gradient-to-br from-accent/10 to-orange-500/5 hover:border-accent/60 hover:from-accent/20 hover:to-orange-500/15 transition-all duration-300 p-8 flex flex-col justify-center items-center gap-4 cursor-pointer"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/0 to-orange-400/0 group-hover:from-accent/10 group-hover:to-orange-400/10 transition-colors duration-300" />
                <div className="relative flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent/50 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-accent-foreground" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-accent-foreground">I'm an Agent</h3>
                    <p className="text-sm text-gray-400 mt-2">Autonomous integration for intelligent operations</p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole('human')}
                className="group relative h-48 rounded-xl border-2 border-accent/30 bg-gradient-to-br from-accent/10 to-orange-500/5 hover:border-accent/60 hover:from-accent/20 hover:to-orange-500/15 transition-all duration-300 p-8 flex flex-col justify-center items-center gap-4 cursor-pointer"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/0 to-orange-400/0 group-hover:from-accent/10 group-hover:to-orange-400/10 transition-colors duration-300" />
                <div className="relative flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent/50 flex items-center justify-center">
                    <User className="w-8 h-8 text-accent-foreground" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-accent-foreground">I'm a Human</h3>
                    <p className="text-sm text-gray-400 mt-2">Controlled skill integration for strategic trading</p>
                  </div>
                </div>
              </motion.button>
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
                className="border-white/20 hover:bg-white/5"
              >
                ← Choose Different Path
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12 text-balance text-white"
          >
            Essential Resources
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* OpenClaw Guide */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card className="group glass-card border-accent/20 bg-gradient-to-br from-accent/10 to-transparent hover:border-accent/40 hover:shadow-lg hover:shadow-accent/20 transition-all duration-300">
                <div className="p-8 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-accent/20 border border-accent/50 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <h3 className="text-xl font-bold text-white">OpenClaw Start Guide</h3>
                    </div>
                    <p className="text-gray-400 mb-4">
                      Complete documentation for integrating OpenClaw into your autonomous systems. Learn advanced trading patterns and agent-specific optimizations.
                    </p>
                  </div>
                  <Link href="https://openclaw.ai/docs" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-accent/20 hover:bg-accent/30 border border-accent/50 text-accent-foreground">
                      <GitBranch className="w-4 h-4 mr-2" />
                      Explore Docs
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* Uniswap V4 LP */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card className="group glass-card border-accent/20 bg-gradient-to-br from-accent/10 to-transparent hover:border-accent/40 hover:shadow-lg hover:shadow-accent/20 transition-all duration-300">
                <div className="p-8 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-accent/20 border border-accent/50 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Uniswap V4 LP Skills</h3>
                    </div>
                    <p className="text-gray-400 mb-4">
                      Advanced liquidity provision strategies using Uniswap V4. Access optimized LP skill implementations and performance benchmarks.
                    </p>
                  </div>
                  <Link href="https://github.com/usiclabs/uniswap-v4-lp" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-accent/20 hover:bg-accent/30 border border-accent/50 text-accent-foreground">
                      <GitBranch className="w-4 h-4 mr-2" />
                      View Repository
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Featured Skill: V4 LP Agent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent-foreground text-sm font-mono mb-4">
                <Zap className="w-3 h-3" />
                Featured Skill
              </div>
              <h2 className="text-3xl font-bold text-white">Autonomous Liquidity Agent</h2>
              <p className="text-gray-400 mt-2">Uniswap V4 concentrated liquidity with auto-compounding, fee harvesting, and Clanker integration</p>
            </div>

            <Card className="glass-card border-accent/30 bg-gradient-to-br from-accent/10 to-transparent overflow-hidden">
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Capabilities</h3>
                    <ul className="space-y-3">
                      {[
                        { icon: Target, text: 'Position Analysis' },
                        { icon: RefreshCw, text: 'Auto-Rebalancing' },
                        { icon: TrendingUp, text: 'Fee Compounding' },
                        { icon: Zap, text: 'Clanker Harvest' },
                        { icon: Flame, text: 'Buy & Burn' },
                        { icon: LayoutGrid, text: 'Single-Sided LP' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 text-accent-foreground flex-shrink-0" />
                          <span className="text-gray-300">{item.text}</span>
                        </div>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Self-Sustaining Economics</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Set up automated fee harvesting to have your agent pay for its own infrastructure:
                    </p>
                    <div className="bg-black/40 border border-accent/20 rounded p-4 mb-4">
                      <div className="font-mono text-xs text-accent-foreground whitespace-pre-wrap break-words">
{`Every 4h:
• Claim protocol fees
• Compound 80% to LP
• Harvest 20% to vault
• Only if > $10 fees`}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Perfect for agents managing token treasuries and liquidity</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Agent Controls Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Try the V4 LP Agent</h2>
            <Card className="glass-card border-accent/20 p-8">
              <ErrorBoundary>
                <V4LPAgentControls />
              </ErrorBoundary>
            </Card>
          </motion.div>

      {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card border-accent/30 bg-gradient-to-r from-accent/10 to-orange-500/5 overflow-hidden relative">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-8 relative text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-accent-foreground mb-4">
                  <Bot className="w-5 h-5" />
                  <span className="font-mono text-sm">Ready to Deploy?</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Start Your Autonomous Operations</h3>
                <p className="text-gray-300 max-w-xl mx-auto">
                  Build intelligent agents with skills for Uniswap V4, Clanker protocol, and more. Integrate with OpenClaw for complete autonomy.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href="https://openclaw.ai" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-accent/20 hover:bg-accent/30 border border-accent/50 text-accent-foreground">
                      Create Agent at OpenClaw
                    </Button>
                  </Link>
                  <Link href="/docs/v4-lp-agent-skill.md" target="_blank">
                    <Button size="lg" variant="outline" className="border-accent/30 hover:bg-accent/10">
                      Read Full Docs
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
