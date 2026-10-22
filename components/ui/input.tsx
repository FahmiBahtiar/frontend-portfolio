import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>
}

function Input({ className, type, ref, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-[#B9E7E6] bg-white px-3 py-2 text-sm text-[#0c282d] placeholder:text-[#527d85] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6FD4E1] focus-visible:border-[#6FD4E1] disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
}

export { Input }
