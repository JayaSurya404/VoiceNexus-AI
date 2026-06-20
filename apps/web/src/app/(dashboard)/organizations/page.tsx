"use client";

import { useQuery } from "@tanstack/react-query";

import { organizationApi } from "@/lib/api/organization-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationsPage() {
  const organizationsQuery = useQuery({
    queryKey: ["organizations"],
    queryFn: () => organizationApi.list(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Organizations</h1>
        <p className="mt-2 text-muted-foreground">
          Manage the SaaS workspaces this user can access.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your organizations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {organizationsQuery.isLoading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : null}

          {organizationsQuery.data?.map((organization) => (
            <div
              className="flex items-center justify-between rounded-2xl border px-4 py-3"
              key={organization.id}
            >
              <div>
                <p className="font-medium">{organization.name}</p>
                <p className="text-sm text-muted-foreground">/{organization.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{organization.role}</Badge>
                <Badge variant="outline">{organization.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
