"use client"

import { ShaderAnimation } from "@/components/ui/shader-lines"

export function DemoShaderLines() {
  return (
    <div className="relative flex h-[650px] w-full flex-col items-center justify-center overflow-hidden rounded-xl">
      <ShaderAnimation />
      <span className="pointer-events-none z-10 text-center text-5xl md:text-6xl lg:text-7xl leading-none font-semibold tracking-tighter whitespace-pre-wrap text-white">
        Liquidity Reimagined
      </span>
    </div>
  )
}
