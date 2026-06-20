import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const capabilities = [
  "AI outbound calling",
  "Inbound call routing",
  "WhatsApp conversations",
  "Lead qualification",
  "Human handoff",
  "Customer memory",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(167,139,250,0.16),transparent_32%),#f8fafc]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
            VN
          </span>
          <span className="text-lg font-semibold tracking-tight">VoiceNexus AI</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Start free</Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pb-20 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
        <div>
          <Badge variant="secondary" className="mb-6">
            Phase 1 SaaS foundation
          </Badge>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            AI calling, WhatsApp, and customer memory in one command center.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            VoiceNexus AI gives teams the foundation for outbound campaigns, inbound support,
            lead qualification, follow-ups, and human handoff—built as a multi-tenant SaaS from
            day one.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register">Create workspace</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Open dashboard</Link>
            </Button>
          </div>
        </div>

        <Card className="border-white/70 bg-white/80 shadow-2xl shadow-slate-200/80 backdrop-blur">
          <CardContent className="p-6">
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Live workspace</p>
                  <h2 className="text-2xl font-semibold">Acme Growth Desk</h2>
                </div>
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">Active</Badge>
              </div>
              <div className="grid gap-3">
                {capabilities.map((capability, index) => (
                  <div
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    key={capability}
                  >
                    <span>{capability}</span>
                    <span className="text-sm text-sky-300">{index < 3 ? "Ready" : "Planned"}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
