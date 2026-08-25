import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Network, Play, RotateCcw } from "lucide-react";
import { PATTERN_META, db, recomputeCluster, BAND_GUIDANCE } from "@/lib/trace/engine";
import { compactCurrency, dateTime } from "@/lib/trace/format";
import { Meter, Mono, PatternBadge, RiskBadge, ScoreRing, SectionTitle } from "@/components/trace/primitives";
import { NetworkGraph } from "@/components/trace/NetworkGraph";
import { useTrace } from "@/lib/trace/context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/network")({
  head: () => ({
    meta: [
      { title: "Network Explorer · TRACE" },
      {
        name: "description",
        content:
          "Reconstruct suspicious money-movement networks, inspect risk signals and run what-if analysis on the active TRACE investigation.",
      },
      { property: "og:title", content: "Network Explorer · TRACE" },
      {
        property: "og:description",
        content: "Graph-first view of mule chains, layering and circular flows across the synthetic TRACE corpus.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NetworkPage,
});

function NetworkPage() {
  const { activeNetworkId } = useTrace();
  const cluster = db.getCluster(activeNetworkId)!;
  const [selected, setSelected] = useState<string | null>(cluster.central_account);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [story, setStory] = useState<number | null>(null);

  const whatIf = useMemo(
    () => recomputeCluster(cluster.id, excluded, new Set()),
    [cluster.id, excluded],
  );

  const toggle = (id: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <header className="panel-surface rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mono text-[10px] uppercase tracking-[0.28em] text-signal">Network explorer</p>
            <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight">
              <Network className="size-5 text-signal" /> {cluster.name}
            </h1>
            <p className="mono mt-1 text-xs text-muted-foreground">{cluster.id}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {cluster.pattern_tags.map((p) => (
                <PatternBadge key={p} pattern={p} size="sm" />
              ))}
            </div>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{cluster.narrative}</p>
          </div>
          <div className="flex items-center gap-4">
            <ScoreRing score={whatIf.score || cluster.cluster_risk_score} label={cluster.level} />
          </div>
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-4">
          <Stat label="Accounts" value={cluster.member_account_ids.length.toString()} />
          <Stat label="Transactions" value={cluster.transaction_ids.length.toString()} />
          <Stat label="Total value" value={compactCurrency(cluster.total_value)} />
          <Stat label="Last activity" value={dateTime(cluster.last_seen)} />
        </dl>
      </header>

      <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="panel-surface rounded-lg p-3">
          <SectionTitle
            title="Reconstructed network"
            hint="Click a node to inspect it. Toggle Story Mode to replay the money movement chronologically."
            action={
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" onClick={() => setStory(story === null ? 0.15 : null)}>
                  <Play className="size-3.5" /> Story mode
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setExcluded(new Set())}>
                  <RotateCcw className="size-3.5" /> Reset
                </Button>
              </div>
            }
          />
          <NetworkGraph
            clusterId={cluster.id}
            selected={selected}
            onSelect={setSelected}
            excludedAccounts={excluded}
            storyCursor={story}
            height={520}
          />
          {story !== null && (
            <div className="px-2 py-3">
              <Slider
                value={[Math.round(story * 100)]}
                onValueChange={([v]) => setStory((v ?? 0) / 100)}
                max={100}
                step={1}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Chronological reveal — {Math.round(story * 100)}% of the network timeline shown.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="panel-surface rounded-lg p-4">
            <SectionTitle title="Behavioural fingerprint" hint="Normalised 0–100 per dimension." />
            <div className="space-y-3">
              {Object.entries(whatIf.fingerprint.velocity ? whatIf.fingerprint : cluster.fingerprint).map(
                ([key, value]) => (
                  <Meter key={key} label={key.replace(/_/g, " ")} value={value as number} />
                ),
              )}
            </div>
          </div>

          <div className="panel-surface rounded-lg p-4">
            <SectionTitle title="Why this scored high" hint="Weighted signal contributions." />
            <div className="space-y-3">
              {(whatIf.signals.length ? whatIf.signals : cluster.signals).map((s) => (
                <Meter key={s.key} label={`${s.label} · ${s.weight}%`} value={s.score} hint={s.reason} tone="risk" />
              ))}
            </div>
            <p className="mt-3 rounded-md border border-border bg-muted/40 p-2.5 text-[11px] leading-snug text-muted-foreground">
              {BAND_GUIDANCE[whatIf.level ?? cluster.level]}
            </p>
          </div>

          <div className="panel-surface rounded-lg p-4">
            <SectionTitle title="Members" hint="Exclude an account to see the network score react." />
            <ul className="space-y-1">
              {cluster.member_account_ids.map((id) => {
                const a = db.getAccount(id)!;
                const off = excluded.has(id);
                return (
                  <li key={id} className="flex items-center justify-between gap-2 rounded-md px-1.5 py-1 hover:bg-accent">
                    <Link
                      to="/accounts/$accountId"
                      params={{ accountId: id }}
                      className="min-w-0 flex-1 truncate"
                    >
                      <Mono className={off ? "line-through opacity-50" : ""}>{id}</Mono>
                      <span className="ml-2 truncate text-[11px] text-muted-foreground">{a.holder}</span>
                    </Link>
                    <RiskBadge score={a.risk_score} size="sm" showScore={false} />
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => toggle(id)}>
                      {off ? "Include" : "Exclude"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card/60 px-3 py-2">
      <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="mono mt-0.5 text-sm">{value}</dd>
    </div>
  );
}
