import { createFileRoute } from "@tanstack/react-router";
import { Bot, LockKeyhole } from "lucide-react";
import { EmptyState } from "@/components/trace/primitives";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "AI Investigation — TRACE-X" },
      { name: "description", content: "AI-assisted investigation workspace for asking questions across TRACE-X evidence and suspicious networks." },
      { property: "og:title", content: "AI Investigation — TRACE-X" },
      { property: "og:description", content: "AI-assisted investigation workspace for TRACE-X analysts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AIInvestigationPage,
});

function AIInvestigationPage() {
  return (
    <div className="space-y-5">
      <header className="panel-surface relative overflow-hidden rounded-lg p-5">
        <div className="grid-surface pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative">
          <p className="mono text-[10px] uppercase tracking-[0.28em] text-signal">Explain / assisted reasoning</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight"><Bot className="size-6 text-signal" /> AI Investigation</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Ask focused questions about networks, transactions and evidence without leaving the investigation cockpit.</p>
        </div>
      </header>
      <EmptyState icon={<LockKeyhole className="size-8" />} title="AI Investigation is in development" description="The assisted investigation workspace is being prepared for evidence-grounded analyst questions." />
    </div>
  );
}