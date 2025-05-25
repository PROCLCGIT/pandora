import * as React from "react"
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative overflow-auto",
      // Custom scrollbar styles
      "[&::-webkit-scrollbar]:w-2",
      "[&::-webkit-scrollbar-track]:bg-gray-100",
      "[&::-webkit-scrollbar-thumb]:bg-gray-300",
      "[&::-webkit-scrollbar-thumb]:rounded-full",
      "[&::-webkit-scrollbar-thumb:hover]:bg-gray-400",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }