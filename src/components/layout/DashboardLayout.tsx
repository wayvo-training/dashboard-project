import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

import Sidebar from "./Sidebar";
import Header from "./Header";

type Section = | "welcome" | "overview" | "analytics" | "table" | "bug-report";

type DashboardLayoutProps = {
  children: React.ReactNode;
  activeSection: Section;
  onSectionChange: (section: Section) => void;
};

export default function DashboardLayout({
  children,
  activeSection,
  onSectionChange,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />

      <SidebarInset>
        <Header />

        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}