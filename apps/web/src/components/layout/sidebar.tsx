"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BrainCircuit,
  Building2,
  Headphones,
  LayoutDashboard,
  MessageCircle,
  PhoneCall,
  UsersRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, active: true },
  { label: "CRM", href: "/crm", icon: UsersRound, active: true },
  { label: "Memory", href: "/memory", icon: BrainCircuit, active: true },
  { label: "Organizations", href: "/organizations", icon: Building2, active: true },
  { label: "Calls", href: "/dashboard", icon: PhoneCall, active: false },
  { label: "WhatsApp", href: "/dashboard", icon: MessageCircle, active: false },
  { label: "Agents", href: "/dashboard", icon: Headphones, active: false },
  { label: "Analytics", href: "/dashboard", icon: BarChart3, active: false },
];

export function Sidebar({ onNavigate }: Readonly<{ onNavigate?: () => void }>) {
  const pathname = usePathname();

  return (
    <aside className="hidden fixed inset-y-0 left-0 z-30 w-72 border-r bg-white lg:flex lg:flex-col">
      <SidebarContent pathname={pathname} onNavigate={onNavigate} />
    </aside>
  );
}

export function SidebarContent({
  pathname,
  onNavigate,
}: Readonly<{
  pathname: string;
  onNavigate?: () => void;
}>) {
  return (
    <div className="flex h-full flex-col">
      <Link className="flex items-center gap-3 px-6 py-6" href="/dashboard" onClick={onNavigate}>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
          VN
        </span>
        <div>
          <p className="font-semibold">VoiceNexus AI</p>
          <p className="text-xs text-muted-foreground">Command center</p>
        </div>
      </Link>

      <nav className="space-y-1 px-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              className={cn(
                "flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              )}
              href={item.href}
              key={item.label}
              onClick={onNavigate}
            >
              <span className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.label}
              </span>
              {!item.active ? <Badge variant="outline">Soon</Badge> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4">
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-medium">VoiceNexus workspace</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            CRM and customer memory are wired into the SaaS foundation.
          </p>
        </div>
      </div>
    </div>
  );
}
