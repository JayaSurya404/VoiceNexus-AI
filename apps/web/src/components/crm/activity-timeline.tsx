"use client";

import type { ActivityDto } from "@voicenexus/contracts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ActivityTimeline({ activities }: Readonly<{ activities: ActivityDto[] }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div className="border-l-2 border-slate-200 pl-4" key={activity.id}>
            <p className="text-sm font-medium">
              {activity.type} · {activity.title}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{activity.description || "No description"}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(activity.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        {activities.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet.</p> : null}
      </CardContent>
    </Card>
  );
}
