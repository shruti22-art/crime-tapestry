import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, FileOutput } from "lucide-react";
import { EmptyState } from "@/components/trace/primitives";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — TRACE-X Investigation Cockpit" },
      { name: "description", content: "Reporting workspace for turning TRACE-X detection and investigation activity into analyst-ready outputs." },
      { property: "og:title", content: "Reports — TRACE-X Investigation Cockpit" },
      { property: "og:description", content: "Build analyst-ready reports from TRACE-X investigation activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div className="space-y-5">
      <header className="panel-surface relative overflow-hidden rounded-lg p-5">
        <div className="grid-surface pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative">
          <p className="mono text-[10px] uppercase tracking-[0.28em] text-signal">Stress-test / outputs</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight"><BarChart3 className="size-6 text-signal" /> Reports</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Create clear, repeatable summaries of detection coverage, suspicious networks and investigation outcomes.</p>
        </div>
      </header>
      <EmptyState icon={<FileOutput className="size-8" />} title="Reporting is in development" description="Saved report templates, exports and investigation summaries are planned for the next TRACE-X release." />
    </div>
  );
}