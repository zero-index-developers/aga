"use client"

import * as React from "react"
import { Network } from "lucide-react"
import pkg from "../package.json"
import { cn } from "@client/lib/utils"

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
      {/* <LogoIcon /> */}
      <div className="flex items-baseline gap-1 truncate">
        <span className="text-2xl font-bold tracking-tight leading-none">AGA</span>
        {showVersion && (
          <span className="text-[9px] text-muted-foreground font-mono opacity-60 leading-none">
            v{pkg.version.split('.')[0]}
          </span>
        )}
      </div>
    </div>
  )
}
