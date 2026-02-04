"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

const StickyHeaderComponent = dynamic(
  () => import("./sticky-header").then(mod => ({ default: mod.StickyHeader })),
  { ssr: false, loading: () => null }
)

export function StickyHeaderWrapper() {
  return (
    <Suspense fallback={null}>
      <StickyHeaderComponent />
    </Suspense>
  )
}
