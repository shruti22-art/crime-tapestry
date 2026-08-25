import { createFileRoute, Link } from "@tanstack/react-router";
import { UserSearch } from "lucide-react";
import { db, whatChanged } from "@/lib/trace/engine";
import { compactCurrency, currency, dateTime } from "@/lib/trace/format";
import { EmptyState, Mono, RiskBadge, ScoreRing, SectionTitle, StatusPill } from "@/components/trace/primitives";

export const Route = createFileRoute("/accounts/$accountId")({
  head: () => ({
    meta: [
      { title: "Account Profile · TRACE" },
      {
        name: "description",
        content:
          "Inspect a synthetic account's baseline behaviour, deviation signals and transaction history inside the TRACE investigation cockpit.",
      },
      { property: "og:title", content: "Account Profile · TRACE" },
      {
        property: "og:description",
        content: "Baseline vs current behaviour, role tagging and full transaction history for a traced account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { accountId } = Route.useParams();
  const account = db.getAccount(accountId);

  if (!account) {
    return (
      <EmptyState
        icon={<UserSearch className="size-8" />}
        title="Account not found"
        description={`No synthetic account matches ${accountId}.`}
      />
    );
  }

  const txns = db.accountTransactions(account.id).slice().reverse();
  const changes = whatChanged(account.id);

  return (
    <div className="space-y-5">
      <header className="panel-surface rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.28em] text-signal">Account profile</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">{account.holder}</h1>
            <p className="mono mt-1 text-xs text-muted-foreground">{account.id}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusPill status={account.current_status} />
              <span className="mono rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {account.role_tag}
              </span>
              {account.cluster_id && (
                <Link to="/network" className="text-[11px] text-signal underline-offset-2 hover:underline">
                  Part of {account.cluster_id}
                </Link>
              )}
            </div>
          </div>
          <ScoreRing score={account.risk_score} />
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-4">
          <Stat label="Opened" value={dateTime(account.created_at)} />
          <Stat label="Age" value={`${account.account_age_days} days`} />
          <Stat label="Home location" value={account.baseline_behaviour.home_location} />
          <Stat label="Transactions" value={txns.length.toString()} />
        </dl>
      </header>

      <section className="panel-surface rounded-lg p-4">
        <SectionTitle title="What changed" hint="Baseline behaviour compared with recent activity." />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {changes.map((c) => {
            const fmt = (n: number) => (c.unit === "currency" ? compactCurrency(n) : n.toString());
            const up = c.current > c.baseline;
            return (
              <div key={c.metric} className="rounded-md border border-border bg-card/60 p-3">
                <p className="text-xs text-muted-foreground">{c.metric}</p>
                <p className="mono mt-1 text-sm">
                  {fmt(c.baseline)} <span className="text-muted-foreground">→</span>{" "}
                  <span className={up ? "text-risk-high" : "text-risk-low"}>{fmt(c.current)}</span>
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel-surface rounded-lg p-4">
        <SectionTitle title="Transaction history" hint={`${txns.length} synthetic transactions`} />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-2 py-2 text-left">Txn</th>
                <th className="px-2 py-2 text-left">Direction</th>
                <th className="px-2 py-2 text-left">Counterparty</th>
                <th className="px-2 py-2 text-right">Amount</th>
                <th className="px-2 py-2 text-left">Type</th>
                <th className="px-2 py-2 text-left">Time</th>
                <th className="px-2 py-2 text-left">Label</th>
              </tr>
            </thead>
            <tbody>
              {txns.slice(0, 80).map((t) => {
                const out = t.sender_id === account.id;
                const other = out ? t.receiver_id : t.sender_id;
                return (
                  <tr key={t.transaction_id} className="border-b border-border/50 hover:bg-accent/60">
                    <td className="px-2 py-1.5">
                      <Mono>{t.transaction_id}</Mono>
                    </td>
                    <td className="px-2 py-1.5">{out ? "Outgoing" : "Incoming"}</td>
                    <td className="px-2 py-1.5">
                      <Link to="/accounts/$accountId" params={{ accountId: other }} className="hover:underline">
                        <Mono>{other}</Mono>
                      </Link>
                    </td>
                    <td className="mono px-2 py-1.5 text-right">{currency(t.amount)}</td>
                    <td className="px-2 py-1.5">{t.transaction_type}</td>
                    <td className="px-2 py-1.5 text-muted-foreground">{dateTime(t.timestamp)}</td>
                    <td className="px-2 py-1.5">
                      {t.label === "suspicious" ? (
                        <RiskBadge score={85} size="sm" showScore={false} />
                      ) : (
                        <span className="text-muted-foreground">normal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
