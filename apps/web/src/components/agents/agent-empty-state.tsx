import { Headphones } from "lucide-react";

export function AgentEmptyState({ title, description }: Readonly<{ title: string; description: string }>) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed bg-white p-8 text-center">
      <Headphones className="h-10 w-10 text-indigo-600" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
