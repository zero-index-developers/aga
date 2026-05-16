"use client";

import { FolderGit2, Home, History, Sliders } from "lucide-react"
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
} from "@client/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@client/components/ui/collapsible"
import { ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { NavUser } from "@client/components/nav-user"
import { LogoIcon, LogoFull } from "@client/components/logo"

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [repos, setRepos] = useState<any[]>([]);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeRepoParam = searchParams.get('repo');

  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://github.com/shadcn.png",
  };

  const navItems = [
    {
      title: "Overview",
      url: "/",
      icon: Home,
      isActive: pathname === "/" && !activeRepoParam,
    },
    {
      title: "Repositories",
      url: "/repos",
      icon: FolderGit2,
      isActive: pathname === "/repos",
      subItems: repos.map((repo) => ({
        title: repo.name,
        url: `/?repo=${encodeURIComponent(repo.name)}`,
        isActive: activeRepoParam === repo.name,
      })),
    },
    {
      title: "Scan Logs",
      url: "/logs",
      icon: History,
      isActive: pathname === "/logs",
    },
    {
      title: "Configs",
      url: "/configs",
      icon: Sliders,
      isActive: pathname === "/configs",
    },
  ];

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
      <SidebarHeader className="border-b border-border p-3 h-14 flex flex-row items-center justify-between group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center overflow-hidden">
        <LogoFull className="group-data-[collapsible=icon]:hidden" />
        <LogoIcon className="hidden group-data-[collapsible=icon]:flex" />
      </SidebarHeader>
      <SidebarContent className="overflow-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                item.subItems ? (
                  <Collapsible key={item.title} defaultOpen className="group/collapsible">
                    <SidebarMenuItem className="relative">
                      <SidebarMenuButton asChild isActive={item.isActive} className="peer pr-8 hover:bg-sidebar-accent/50 transition-colors">
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
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
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                                <Link href={subItem.url}>
                                  <span className="truncate">{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
