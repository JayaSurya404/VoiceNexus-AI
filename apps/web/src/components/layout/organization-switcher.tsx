"use client";

import { ChevronsUpDown } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function OrganizationSwitcher() {
  const organizations = useAuthStore((state) => state.organizations);
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const setActiveOrganizationId = useAuthStore((state) => state.setActiveOrganizationId);
  const activeOrganization =
    organizations.find((organization) => organization.id === activeOrganizationId) ?? organizations.at(0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="max-w-full justify-between gap-3" variant="outline">
          <span className="truncate">
            {activeOrganization ? activeOrganization.name : "Select organization"}
          </span>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((organization) => (
          <DropdownMenuItem
            key={organization.id}
            onClick={() => setActiveOrganizationId(organization.id)}
          >
            <div>
              <p className="font-medium">{organization.name}</p>
              <p className="text-xs text-muted-foreground">{organization.role}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
