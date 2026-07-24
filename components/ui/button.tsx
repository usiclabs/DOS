import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive glow-button",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/85 active:scale-95 transition-all',
        destructive:
          'bg-destructive text-white shadow-sm hover:bg-destructive/85 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 active:scale-95 transition-all',
        outline:
          'border bg-background shadow-sm hover:bg-accent/10 hover:text-accent-foreground hover:border-accent dark:bg-input/20 dark:border-input/50 dark:hover:bg-input/40 active:scale-95 transition-all',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/75 active:scale-95 transition-all',
        ghost:
          'hover:bg-accent/15 hover:text-accent-foreground dark:hover:bg-accent/20 active:scale-95 transition-all',
        link: 'text-primary underline-offset-4 hover:underline',
        glass:
          'relative bg-white/6 text-white backdrop-blur-md border border-white/12 hover:bg-white/10 hover:border-white/20 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300',
        "glass-primary":
          'relative bg-[rgba(80,200,150,0.12)] text-white backdrop-blur-md border border-[rgba(80,200,150,0.25)] hover:bg-[rgba(80,200,150,0.18)] hover:border-[rgba(80,200,150,0.4)] shadow-md hover:shadow-[0_8px_24px_rgba(80,200,150,0.2)] hover:scale-105 active:scale-95 transition-all duration-300',
        "glass-gold":
          'relative bg-[rgba(230,160,50,0.12)] text-white backdrop-blur-md border border-[rgba(230,160,50,0.25)] hover:bg-[rgba(230,160,50,0.18)] hover:border-[rgba(230,160,50,0.4)] shadow-md hover:shadow-[0_8px_24px_rgba(230,160,50,0.2)] hover:scale-105 active:scale-95 transition-all duration-300',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  if (asChild) {
    return (
      <Slot
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...(props as React.ComponentProps<typeof Slot>)}
      />
    )
  }

  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
