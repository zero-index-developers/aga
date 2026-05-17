'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export function HeaderActions({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const target = document.getElementById('header-actions-portal')
  if (!target) return null

  return createPortal(children, target)
}
