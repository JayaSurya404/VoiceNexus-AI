import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MetricCard({ label, value, loading }: Readonly<{ label: string; value: string | number; loading?: boolean }>) {
  return <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label}</p>{loading ? <Skeleton className="mt-3 h-8 w-20" /> : <p className="mt-2 text-3xl font-semibold">{value}</p>}</CardContent></Card>;
}
