import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        <div>
          <h1 className="font-semibold">
            Dashboard
          </h1>

          <p className="text-xs text-muted-foreground">
            Ecommerce performance analytics
          </p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
      >
        <Bell />
      </Button>
    </header>
  );
}