import { createFileRoute } from "@tanstack/react-router";
import { BriefcaseBusiness, ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/trace/primitives";

export const Route = createFileRoute("/cases")({
  head: () => ({
    meta: [
      { title: "Cases — TRACE-X Investigation Cockpit" },
      { name: "description", content: "Investigation case workspace for packaging TRACE-X findings, evidence and analyst decisions." },
      { property: "og:title", content: "Cases — TRACE-X Investigation Cockpit" },
      { property: "og:description", content: "Package suspicious-network findings into analyst cases." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CasesPage,
});

function CasesPage() {
  return (
    <div className="space-y-5">
      <header className="panel-surface relative overflow-hidden rounded-lg p-5">
        <div className="grid-surface pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative">
          <p className="mono text-[10px] uppercase tracking-[0.28em] text-signal">Investigate / evidence</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight"><BriefcaseBusiness className="size-6 text-signal" /> Cases</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Turn network findings into reviewable case files with evidence, notes, ownership and outcomes.</p>
        </div>
      </header>
      <EmptyState icon={<ClipboardList className="size-8" />} title="Case workspace is coming soon" description="Case creation, evidence packaging and analyst feedback will be available in a future TRACE-X module." />
    </div>
  );
}