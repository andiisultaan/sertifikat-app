"use client";

import dynamic from "next/dynamic";
import { GraduationCap } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

function SidebarFallback({ variant }: { variant?: "sidebar" | "floating" | "inset" }) {
  return (
    <Sidebar collapsible="offcanvas" variant={variant}>
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
      <SidebarContent />
      <SidebarFooter />
    </Sidebar>
  );
}

const AppSidebar = dynamic(() => import("@/components/app-sidebar").then(m => m.AppSidebar), { ssr: false, loading: () => <SidebarFallback variant="inset" /> });

export { AppSidebar };
