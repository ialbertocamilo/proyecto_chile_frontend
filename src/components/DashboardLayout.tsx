import type * as React from "react"
import { Navbar } from "./Navbar"
import { TopBar } from "./TopBar"
import { Footer } from "./Footer"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        <Navbar />
        <SidebarInset className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">
            <SidebarTrigger className="mb-4 md:hidden" />
            {children}
          </main>
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

