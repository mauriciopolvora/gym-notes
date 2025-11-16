"use client";

import { useQuery } from "convex/react";
import { Dumbbell, FilePlus, Scroll } from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { NavUser } from "./user-sidebar";

// Menu items.
const items = [
  {
    title: "home",
    url: "/dashboard",
    icon: Dumbbell,
  },
  {
    title: "create new template",
    url: "/dashboard/create-template",
    icon: FilePlus,
  },
  {
    title: "workouts",
    url: "/dashboard/workouts",
    icon: Scroll,
  },
];

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const user = useQuery(api.auth.getCurrentUser);

  const handleNavigation = () => {
    setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              onClick={handleNavigation}
            >
              <Link href="/dashboard">
                <Dumbbell className="!size-5" />
                <span className="text-base font-semibold">Gym Notes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild onClick={handleNavigation}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <NavUser
            user={{
              name: user.name ?? "User",
              email: user.email ?? "",
              avatar: user.image ?? "",
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
