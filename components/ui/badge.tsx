import type * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border hover:bg-accent/10",
        accent: "border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 hover:border-accent/50 backdrop-blur-sm",
        emerald: "border-[rgba(80,200,150,0.3)] bg-[rgba(80,200,150,0.1)] text-emerald-100 hover:bg-[rgba(80,200,150,0.15)] hover:border-[rgba(80,200,150,0.5)] backdrop-blur-sm",
        gold: "border-[rgba(230,160,50,0.3)] bg-[rgba(230,160,50,0.1)] text-amber-100 hover:bg-[rgba(230,160,50,0.15)] hover:border-[rgba(230,160,50,0.5)] backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
