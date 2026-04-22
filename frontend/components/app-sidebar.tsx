"use client";

import * as React from "react";
import { Award, BarChart3, BookOpen, GraduationCap, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import type { UserRole } from "@/services/api/authService";

type NavItem = { title: string; url: string; icon: LucideIcon; roles?: UserRole[] };

const allNavItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Siswa", url: "/siswa", icon: Users, roles: ["super_admin", "admin"] },
  { title: "UKK", url: "/ukk", icon: BookOpen, roles: ["super_admin", "admin"] },
  { title: "Nilai", url: "/nilai", icon: BarChart3 },
  { title: "Sertifikat", url: "/sertifikat", icon: Award, roles: ["super_admin", "admin"] },
  { title: "Pengguna", url: "/users", icon: ShieldCheck, roles: ["super_admin"] },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();
  const role = user?.role;

  const navItems = allNavItems.filter(item => !item.roles || (role && item.roles.includes(role)));

  const currentUser = {
    name: user?.name ?? "User",
    email: user?.email ?? "",
    avatar: "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<a href="/dashboard" />} className="data-[slot=sidebar-menu-button]:p-1.5!">
              <GraduationCap className="size-5!" />
              <span className="text-base font-semibold">Sertifikat UKK</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
