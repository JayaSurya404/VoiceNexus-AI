"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { OrganizationSwitcher } from "./organization-switcher";
import { SidebarContent } from "./sidebar";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b bg-white/85 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button className="lg:hidden" size="icon" variant="ghost">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-72 p-0" side="left">
            <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
            <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="min-w-0 flex-1">
          <OrganizationSwitcher />
        </div>

        <UserMenu />
      </div>
    </header>
  );
}
