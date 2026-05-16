"use client"

import * as React from "react"
import { Network } from "lucide-react"
import pkg from "../package.json"
import { cn } from "@/lib/utils"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  showVersion?: boolean
}

export function LogoIcon({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-1.5 bg-primary rounded-md shrink-0 flex items-center justify-center", className)}
      {...props}
    >
      <Network className="w-4 h-4 text-primary-foreground" />
    </div>
  )
}

export function LogoFull({ className, showVersion = true, ...props }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 overflow-hidden", className)} {...props}>
      <LogoIcon />
      <div className="flex flex-col items-start justify-center truncate">
        <span className="text-xs font-bold tracking-tight leading-none mb-1">AGA Console</span>
        {showVersion && (
          <span className="text-[8px] text-muted-foreground font-mono opacity-60 leading-none">
            v{pkg.version}
          </span>
        )}
      </div>
    </div>
  )
}
