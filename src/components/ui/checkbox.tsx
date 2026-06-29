"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { Check } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group/checkbox flex size-4 shrink-0 items-center justify-center rounded border border-white/20 bg-white/10 text-cyan-950 outline-none transition focus-visible:border-cyan-300/60 focus-visible:ring-3 focus-visible:ring-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-cyan-200 data-[checked]:bg-cyan-200",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <Check className="size-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
