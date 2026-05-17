import { SidebarProvider } from "@client/components/ui/sidebar"
import { AppSidebar } from "@client/components/layout/app-sidebar"
import { Suspense } from "react"
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Suspense fallback={<div className="w-64 border-r border-border bg-sidebar" />}>
        <AppSidebar />
      </Suspense>
      <main className="flex-1 min-w-0 flex flex-col h-screen">
        {children}
      </main>
    </SidebarProvider>
  )
}
