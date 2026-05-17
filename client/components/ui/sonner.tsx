'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="bottom-right"
      gap={8}
      icons={{
        success: <CheckCircle2 className="w-4 h-4" />,
        error: <XCircle className="w-4 h-4" />,
        warning: <AlertTriangle className="w-4 h-4" />,
        info: <Info className="w-4 h-4" />,
        loading: <Loader2 className="w-4 h-4 animate-spin" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-xl text-sm font-medium',
          title: 'text-sm font-semibold tracking-tight',
          description: 'text-xs opacity-70',
          success:
            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 [&_svg]:text-emerald-400',
          error:
            'bg-red-500/10 border-red-500/20 text-red-400 [&_svg]:text-red-400',
          warning:
            'bg-amber-500/10 border-amber-500/20 text-amber-400 [&_svg]:text-amber-400',
          info: 'bg-blue-500/10 border-blue-500/20 text-blue-400 [&_svg]:text-blue-400',
          loading:
            'bg-primary/10 border-primary/20 text-primary [&_svg]:text-primary',
          default:
            'bg-card/80 border-border/50 text-foreground',
          actionButton:
            'bg-primary text-primary-foreground text-xs font-bold rounded-lg px-3 py-1.5 hover:bg-primary/90 transition-colors',
          cancelButton:
            'bg-muted text-muted-foreground text-xs font-medium rounded-lg px-3 py-1.5 hover:bg-accent transition-colors',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
