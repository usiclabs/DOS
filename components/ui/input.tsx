import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/20 border-input/60 flex h-9 w-full min-w-0 rounded-[0.5rem] border bg-transparent px-3 py-1 text-base shadow-sm transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring/80 focus-visible:ring-ring/30 focus-visible:ring-[2px] focus-visible:bg-input/10',
        'aria-invalid:ring-destructive/15 dark:aria-invalid:ring-destructive/30 aria-invalid:border-destructive/50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
