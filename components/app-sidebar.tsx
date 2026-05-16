"use client";

import { FolderGit2, Home, Network } from "lucide-react"
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
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import pkg from "../package.json"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [repos, setRepos] = useState<any[]>([]);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeRepoParam = searchParams.get('repo');

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
      <SidebarHeader className="border-b border-border p-3 h-14 flex flex-row items-center justify-between group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden">
          <div className="p-1.5 bg-primary rounded-md shrink-0">
            <Network className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight truncate">AGA Console</span>
        </div>
        <SidebarTrigger className="shrink-0" />
      </SidebarHeader>
      <SidebarContent className="overflow-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Overview */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/" && !activeRepoParam}>
                  <Link href="/">
                    <Home />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Repositories Dropdown */}
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem className="relative">
                  <SidebarMenuButton asChild isActive={pathname === "/repos"} className="peer pr-8 hover:bg-sidebar-accent/50 transition-colors">
                    <Link href="/repos">
                      <FolderGit2 />
                      <span>Repositories</span>
                    </Link>
                  </SidebarMenuButton>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction
                      className="transition-all duration-200 hover:bg-primary/10 hover:text-primary data-[state=open]:rotate-90 right-2 group-data-[collapsible=icon]:hidden"
                      showOnHover={false}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {repos.map((repo) => (
                        <SidebarMenuSubItem key={repo.name}>
                          <SidebarMenuSubButton asChild isActive={activeRepoParam === repo.name}>
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/40 overflow-hidden">
        <div className={`flex items-center transition-all duration-300 ease-in-out text-muted-foreground uppercase tracking-widest font-semibold opacity-70 ${isCollapsed ? 'justify-center text-[9px]' : 'justify-between text-[10px]'}`}>
          <span className={`transition-all duration-300 ease-in-out origin-left ${isCollapsed ? 'opacity-0 w-0 scale-0' : 'opacity-100 w-auto scale-100'}`}>
            AGA Console
          </span>
          <span className="transition-all duration-300 ease-in-out">
            v{isCollapsed ? pkg.version.split('.')[0] : pkg.version}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
