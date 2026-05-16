"use client";

import { FolderGit2, Home, Settings, Network } from "lucide-react"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenu,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

const items = [
  {
    title: "Overview",
    url: "/", // Maps to / in the subdomain
    icon: Home,
  },
  {
    title: "Repositories",
    url: "/repos",
    icon: FolderGit2,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

export function AppSidebar() {
  const [repos, setRepos] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch('/api/repo/list');
        const data = await res.json();
        setRepos(data);
      } catch (error) {
        console.error('Failed to fetch repos:', error);
      }
    }
    fetchRepos();
  }, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border p-3 h-14 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden">
          <div className="p-1.5 bg-primary rounded-md shrink-0">
            <Network className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight truncate">AGA Console</span>
        </div>
        <SidebarTrigger className="shrink-0" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Overview */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <Home />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Repositories Dropdown */}
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem className="relative">
                  <SidebarMenuButton asChild className="peer pr-8 hover:bg-sidebar-accent/50 transition-colors">
                    <Link href="/repos">
                      <FolderGit2 />
                      <span>Repositories</span>
                    </Link>
                  </SidebarMenuButton>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction 
                      className="transition-all duration-200 hover:bg-primary/10 hover:text-primary data-[state=open]:rotate-90 right-2"
                      showOnHover={false}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {repos.map((repo) => (
                        <SidebarMenuSubItem key={repo.name}>
                          <SidebarMenuSubButton asChild>
                            <Link href={`/?repo=${encodeURIComponent(repo.name)}`}>
                              <span className="truncate">{repo.name}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Settings */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
