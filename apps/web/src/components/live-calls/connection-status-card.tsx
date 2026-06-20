import { Wifi, WifiOff } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ConnectionStatusCard({
  activeCallCount,
  status,
}: Readonly<{
  activeCallCount: number;
  status: "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "ERROR";
}>) {
  const connected = status === "CONNECTED";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Supervisor connection</CardTitle>
        {connected ? <Wifi className="h-4 w-4 text-emerald-600" /> : <WifiOff className="h-4 w-4 text-slate-400" />}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-semibold", connected ? "text-emerald-700" : "text-slate-700")}>
          {status}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{activeCallCount} active realtime call sessions</p>
      </CardContent>
    </Card>
  );
}
