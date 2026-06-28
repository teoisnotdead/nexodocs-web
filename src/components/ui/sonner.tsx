"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast border-white/12 bg-[#171a26] text-white shadow-[0_18px_70px_rgba(0,0,0,0.38)]",
          description: "text-white/65",
          actionButton: "bg-cyan-200 text-slate-950",
          cancelButton: "bg-white/10 text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
