import {
  BarChart3,
  LayoutDashboard,
    Bug,
  Table2,
} from "lucide-react";

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
  },
  {
    title: "Analytics",
    icon: BarChart3,
  },
  {
    title: "Data Table",
    icon: Table2,
  },
    {
    title: "Bug Report",
    icon: Bug,
  },
];

type Section = | "welcome" | "overview" | "analytics" | "table"  | "bug-report";

type SidebarProps = {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
};

export default function Sidebar({
  activeSection,
  onSectionChange,
}: SidebarProps) {
  return (
    <ShadcnSidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Workspace
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const section =
                item.title === "Overview"
                  ? "overview"
                  : item.title === "Analytics"
                    ? "analytics"
                    : item.title === "Data Table"
                      ? "table"
                      : "bug-report";
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={activeSection === section}
                      tooltip={item.title}
                      onClick={() =>
                        onSectionChange(section)
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </ShadcnSidebar>
  );
}