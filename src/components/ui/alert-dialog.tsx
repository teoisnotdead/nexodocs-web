"use client"

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"
import * as React from "react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger {...props} />
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal {...props} />
}

function AlertDialogBackdrop({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Backdrop>) {
  return (
    <AlertDialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Popup>) {
  return (
    <AlertDialogPortal>
      <AlertDialogBackdrop />
      <AlertDialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <AlertDialogPrimitive.Popup
          className={cn(
            "grid w-full max-w-md gap-4 rounded-md border border-white/12 bg-[#171a26] p-5 text-white shadow-[0_24px_90px_rgba(0,0,0,0.5)] outline-none transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
            className,
          )}
          {...props}
        >
          {children}
        </AlertDialogPrimitive.Popup>
      </AlertDialogPrimitive.Viewport>
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("grid gap-2", className)} {...props} />
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      className={cn("text-base font-semibold tracking-normal", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      className={cn("text-sm leading-6 text-white/65", className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Close>) {
  return (
    <AlertDialogPrimitive.Close
      className={cn(
        buttonVariants({ variant: "outline" }),
        "h-9 rounded-md border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.12]",
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        buttonVariants({ variant: "destructive" }),
        "h-9 rounded-md border-rose-200/20 bg-rose-300/15 text-rose-50 hover:bg-rose-300/25",
        className,
      )}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
}
