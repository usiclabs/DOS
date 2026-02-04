'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, User, Copy, Check, Terminal, BookOpen, GitBranch, Zap, Target, RefreshCw, TrendingUp, 
  Flame, LayoutGrid, ArrowRight, Settings, Code2, Lightbulb, Shield, Gauge, AlertCircle, Lock
} from 'lucide-react'
import { ErrorBoundary } from '@/components/error-boundary'
import { V4LPAgentControls } from '@/components/v4-lp-agent-controls'
import { StickyHeaderWrapper } from '@/components/sticky-header-wrapper'
import { motion } from 'framer-motion'

const DeusTicker = dynamic(() => import('@/components/deus-ticker').then(mod => ({ default: mod.DeusTicker })), { ssr: false })

export default function SkillPage() {
  const [selectedRole, setSelectedRole] = useState<'agent' | 'human' | null>(null)
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCommand(text)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  const AgentSetup = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-accent/20 border border-accent/50 flex items-center justify-center">
            <Bot className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Deploy Autonomous Agent</h2>
            <p className="text-gray-400 text-sm">Complete setup in 3 simple steps</p>
          </div>
        </div>
      </div>

      {/* Step Progress Indicator */}
      <div className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-lg">
        {[
          { num: 1, label: 'Install', desc: 'Agent runtime & skills' },
          { num: 2, label: 'Configure', desc: 'Wallet & preferences' },
          { num: 3, label: 'Activate', desc: 'Go autonomous' },
        ].map((step, idx) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex-1 flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-accent/20 border-2 border-accent/50 flex items-center justify-center font-bold text-accent-foreground text-sm shrink-0">
              {step.num}
            </div>
            <div className="flex-1 hidden sm:block">
              <div className="text-sm font-semibold text-white">{step.label}</div>
              <div className="text-xs text-gray-400">{step.desc}</div>
            </div>
            {idx < 2 && <ArrowRight className="w-5 h-5 text-accent/40 hidden lg:block shrink-0" />}
          </motion.div>
        ))}
      </div>

      {/* Installation Methods */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg border-2 border-accent/30 bg-accent/5 hover:bg-accent/10 hover:border-accent/60 transition-all duration-300 group"
        >
          <Code2 className="w-5 h-5 text-accent-foreground mb-2" />
          <div className="font-mono text-sm text-accent-foreground font-semibold">molthub</div>
          <div className="text-xs text-gray-400">Fully automated</div>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg border-2 border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
        >
          <Settings className="w-5 h-5 text-white mb-2" />
          <div className="font-mono text-sm text-white font-semibold">manual</div>
          <div className="text-xs text-gray-400">Custom setup</div>
        </motion.button>
      </div>

      {/* Installation Command */}
      <Card className="glass-card border-accent/20 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-accent-foreground" />
              <div>
                <span className="text-sm font-semibold text-accent-foreground uppercase tracking-wider">Step 1: Install</span>
                <p className="text-xs text-gray-400 mt-1">Download and initialize the agent runtime</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-accent/10 text-accent-foreground border-accent/30 shrink-0">Required</Badge>
          </div>
          <button
            onClick={() => copyToClipboard('npx liquidit@latest install-agent --skill v4-lp')}
            className="w-full text-left group"
          >
            <div className="font-mono text-sm bg-black/60 p-4 rounded border border-accent/20 text-accent-foreground overflow-x-auto shadow-inner hover:border-accent/40 transition-colors duration-300 group-hover:shadow-lg group-hover:shadow-accent/10">
              npx liquidit@latest install-agent --skill v4-lp
            </div>
          </button>
          <div className="flex items-start gap-2 mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
            <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300">Installs Node.js runtime and V4 LP skill module automatically</p>
          </div>
          {copiedCommand === 'npx liquidit@latest install-agent --skill v4-lp' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-green-400 text-sm mt-2"
            >
              <Check className="w-4 h-4" />
              Copied to clipboard
            </motion.div>
          )}
        </div>
      </Card>

      {/* Configuration */}
      <Card className="glass-card border-accent/20 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gauge className="w-5 h-5 text-accent-foreground" />
            <div>
              <span className="text-sm font-semibold text-accent-foreground uppercase tracking-wider">Step 2: Configure</span>
              <p className="text-xs text-gray-400">Setup wallet and parameters</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { icon: Lock, title: 'Secure Wallet Setup', desc: 'Agent receives API key and multi-sig wallet access' },
              { icon: Shield, title: 'Security Parameters', desc: 'Rate limits, spend caps, and approval thresholds' },
              { icon: Settings, title: 'Liquidity Preferences', desc: 'Configure trading pairs, tick ranges, and fee tiers' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 p-3 bg-accent/5 rounded border border-accent/20 hover:border-accent/40 transition-colors"
              >
                <item.icon className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      {/* Activation */}
      <Card className="glass-card bg-gradient-to-br from-accent/10 to-orange-500/5 border-accent/30 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-accent-foreground animate-pulse" />
            <div>
              <span className="text-sm font-semibold text-accent-foreground uppercase tracking-wider">Step 3: Activate</span>
              <p className="text-xs text-gray-400">Deploy to autonomous operations</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 bg-accent/20 hover:bg-accent/30 border border-accent/50 rounded-lg font-semibold text-accent-foreground transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Verify & Activate Agent
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          <p className="text-xs text-gray-400 text-center mt-3">Agent verifies wallet, receives confirmation token, and starts autonomous operations</p>
        </div>
      </Card>
    </motion.div>
  )

  const HumanSetup = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-accent/20 border border-accent/50 flex items-center justify-center">
            <User className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Setup Your Skills</h2>
            <p className="text-gray-400 text-sm">Get trading-ready in minutes</p>
          </div>
        </div>
      </div>

      {/* Installation Methods */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg border-2 border-accent/30 bg-accent/5 hover:bg-accent/10 hover:border-accent/60 transition-all duration-300"
        >
          <Code2 className="w-5 h-5 text-accent-foreground mb-2" />
          <div className="font-mono text-sm text-accent-foreground font-semibold">npm</div>
          <div className="text-xs text-gray-400">Package manager</div>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg border-2 border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
        >
          <Settings className="w-5 h-5 text-white mb-2" />
          <div className="font-mono text-sm text-white font-semibold">Docker</div>
          <div className="text-xs text-gray-400">Containerized</div>
        </motion.button>
      </div>

      {/* Quick Start */}
      <Card className="glass-card border-accent/20 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-accent-foreground" />
              <div>
                <span className="text-sm font-semibold text-accent-foreground uppercase tracking-wider">Quick Start</span>
                <p className="text-xs text-gray-400">Install and initialize</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard('npm install @liquidit/skills && liquidit init')}
            className="w-full text-left"
          >
            <div className="font-mono text-sm bg-black/60 p-4 rounded border border-accent/20 text-accent-foreground overflow-x-auto shadow-inner hover:border-accent/40 transition-colors">
              npm install @liquidit/skills && liquidit init
            </div>
          </button>
          {copiedCommand === 'npm install @liquidit/skills && liquidit init' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-green-400 text-sm mt-2"
            >
              <Check className="w-4 h-4" />
              Copied to clipboard
            </motion.div>
          )}
        </div>
      </Card>

      {/* Setup Steps */}
      <div className="space-y-3">
        {[
          { icon: Settings, title: 'Configure Preferences', desc: 'Set trading pairs, risk parameters, and execution strategy' },
          { icon: Lock, title: 'Connect Wallet', desc: 'Link your wallet and authorize via secure signature' },
          { icon: TrendingUp, title: 'Deploy Skills', desc: 'Activate V4 LP, monitoring, and auto-compound features' },
        ].map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="glass-card border-accent/20 hover:border-accent/40 transition-all duration-300">
              <div className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{step.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{step.desc}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  return (
    <main className="min-h-screen bg-background">
      <StickyHeaderWrapper />
      <ErrorBoundary>
        <Suspense fallback={null}>
          <DeusTicker />
        </Suspense>
      </ErrorBoundary>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 border-b border-accent/10">
        <div className="relative max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center space-y-6 mb-16">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-accent/30 text-accent-foreground text-sm font-mono"
            >
              <Zap className="w-3 h-3 animate-pulse" />
              Autonomous Liquidity Management
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
              Deploy <span className="bg-gradient-to-r from-amber-200 via-orange-400 to-red-400 bg-clip-text text-transparent">Skills</span>
            </h1>

            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Unleash autonomous agents or human-controlled traders with Liquidit skills. Manage Uniswap V4 liquidity, auto-compound fees, and harvest rewards—all in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedRole('agent')}
                className="px-8 py-3 bg-accent/20 hover:bg-accent/30 border border-accent/50 rounded-lg font-semibold text-accent-foreground transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Bot className="w-5 h-5" />
                Deploy Agent
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedRole('human')}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                <User className="w-5 h-5" />
                Setup Skills
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Setup Content Section */}
      {selectedRole && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-accent/5 to-background">
          <div className="max-w-4xl mx-auto">
            {selectedRole === 'agent' && <AgentSetup />}
            {selectedRole === 'human' && <HumanSetup />}
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 pt-8 border-t border-accent/20"
            >
              <Button
                onClick={() => setSelectedRole(null)}
                variant="outline"
                className="border-white/20 hover:bg-white/5"
              >
                ← Back to Choose
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Featured Skill */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <Badge className="glass-card text-accent-foreground border-accent/30 px-4 py-2">
              <Zap className="w-3 h-3 mr-2" />
              Featured Skill
            </Badge>
            <h2 className="text-4xl font-bold text-white">Uniswap V4 Autonomous Liquidity</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Enterprise-grade concentrated liquidity with auto-compounding, fee harvesting, and self-sustaining economics</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card border-accent/30 bg-gradient-to-br from-accent/10 to-transparent overflow-hidden">
              <div className="p-8">
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  {[
                    { icon: Target, title: 'Position Analysis', desc: 'Real-time tick analysis and in-range monitoring' },
                    { icon: RefreshCw, title: 'Auto-Rebalancing', desc: 'Intelligent position rebalancing on drift' },
                    { icon: TrendingUp, title: 'Fee Compounding', desc: 'Automatic fee reinvestment to LP' },
                    { icon: Zap, title: 'Clanker Harvest', desc: 'Integrated meme token protocol support' },
                    { icon: Flame, title: 'Buy & Burn', desc: 'Deflationary treasury management' },
                    { icon: LayoutGrid, title: 'Single-Sided LP', desc: 'Asymmetric liquidity provisioning' },
                  ].map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="text-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center mx-auto mb-3">
                        <feature.icon className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-400">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-accent/20">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-5 h-5 text-accent-foreground" />
                      <h3 className="text-lg font-bold text-white">Self-Sustaining Model</h3>
                    </div>
                    <div className="bg-black/40 border border-accent/20 rounded-lg p-4 space-y-2 font-mono text-xs text-accent-foreground mb-4">
                      <div>Every 4 hours:</div>
                      <div className="ml-4">• Claim protocol fees</div>
                      <div className="ml-4">• Compound 80% to LP</div>
                      <div className="ml-4">• Harvest 20% to vault</div>
                      <div className="ml-4">• Only if ≥ $10 fees</div>
                    </div>
                    <p className="text-sm text-gray-400">Agent pays for infrastructure through fee capture</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="w-5 h-5 text-accent-foreground" />
                      <h3 className="text-lg font-bold text-white">Key Benefits</h3>
                    </div>
                    <ul className="space-y-2">
                      {[
                        'Zero upfront infrastructure costs',
                        'Autonomous operation 24/7',
                        'Optimized gas expenditure',
                        'Real-time performance tracking',
                        'Multi-protocol integration',
                        'Treasury management automation'
                      ].map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-300 text-sm">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white/5 to-background">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-12"
          >
            <h2 className="text-3xl font-bold text-white">Interactive Agent Demo</h2>
            <p className="text-gray-400">Test skill operations in real-time</p>
          </motion.div>

          <Card className="glass-card border-accent/20 p-8">
            <ErrorBoundary>
              <V4LPAgentControls />
            </ErrorBoundary>
          </Card>
        </div>
      </section>

      {/* Resources */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-white/5 border-t border-accent/10">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12 text-white"
          >
            Documentation & Resources
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              {
                icon: BookOpen,
                title: 'OpenClaw Start Guide',
                desc: 'Complete documentation for integrating OpenClaw into autonomous systems',
                link: 'https://openclaw.ai/docs',
              },
              {
                icon: GitBranch,
                title: 'Uniswap V4 LP Repository',
                desc: 'Advanced liquidity provision strategies and performance benchmarks',
                link: 'https://github.com/usiclabs/uniswap-v4-lp',
              }
            ].map((resource, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="glass-card border-accent/20 bg-gradient-to-br from-accent/10 to-transparent hover:border-accent/40 transition-all duration-300 h-full">
                  <div className="p-8 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-accent/20 border border-accent/50 flex items-center justify-center">
                        <resource.icon className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{resource.title}</h3>
                    </div>
                    <p className="text-gray-400 mb-6 flex-grow">{resource.desc}</p>
                    <Link href={resource.link} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-accent/20 hover:bg-accent/30 border border-accent/50 text-accent-foreground">
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card border-accent/30 bg-gradient-to-r from-accent/10 to-orange-500/5 overflow-hidden">
              <div className="p-12 relative text-center space-y-6">
                <div className="flex items-center justify-center gap-2 text-accent-foreground mb-2">
                  <Zap className="w-5 h-5 animate-pulse" />
                  <span className="font-mono text-sm uppercase tracking-wider">Ready to Deploy</span>
                </div>
                <h3 className="text-3xl font-bold text-white">Start Your Autonomous Operations</h3>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  Build intelligent agents with skills for Uniswap V4, treasury management, and DeFi protocols. Deploy in minutes, operate autonomously forever.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <Link href="https://openclaw.ai" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-accent/20 hover:bg-accent/30 border border-accent/50 text-accent-foreground">
                      <Bot className="w-5 h-5 mr-2" />
                      Create Agent at OpenClaw
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="border-accent/30 hover:bg-accent/10">
                    View API Reference
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

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
      <StickyHeaderWrapper />
      <ErrorBoundary>
        <Suspense fallback={null}>
          <DeusTicker />
        </Suspense>
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
