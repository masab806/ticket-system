import { useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  Repeat,
  Wallet,
  ExternalLink,
  Receipt,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Badge } from '@/components/ui/badge'
import { transactions, formatUsd } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const filters = ['All', 'Purchase', 'Resale', 'Transfer']

const typeIcon = {
  Purchase: ArrowUpRight,
  Resale: ArrowDownLeft,
  Transfer: Send,
  Payout: Wallet,
}

export default function HistoryPage() {
  const [filter, setFilter] = useState('All')

  const visible = transactions.filter((t) => filter === 'All' || t.type === filter)
  const spent = transactions
    .filter((t) => t.direction === 'out')
    .reduce((s, t) => s + t.amount, 0)
  const earned = transactions
    .filter((t) => t.direction === 'in')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Receipt className="size-4" />
              Activity
            </div>
            <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Transaction history
            </h1>
            <p className="mt-2 text-muted-foreground">
              Every purchase, resale, and transfer — recorded on-chain and
              auditable.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Stat label="Total spent" value={formatUsd(spent)} tone="out" />
              <Stat label="Total earned" value={formatUsd(earned)} tone="in" />
              <Stat label="Transactions" value={String(transactions.length)} tone="neutral" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                  filter === f
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {visible.map((t, i) => {
              const Icon = typeIcon[t.type]
              const inbound = t.direction === 'in'
              return (
                <div
                  key={t.id}
                  className={cn(
                    'flex items-center gap-4 p-4',
                    i !== visible.length - 1 && 'border-b border-border',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full',
                      inbound ? 'bg-success/15 text-success' : 'bg-accent text-accent-foreground',
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{t.event}</p>
                      <Badge variant={t.status === 'Confirmed' ? 'success' : 'warning'}>
                        {t.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{t.type}</span>
                      <span>·</span>
                      <span>{t.date}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'font-semibold',
                        inbound ? 'text-success' : 'text-foreground',
                      )}
                    >
                      {t.amount === 0
                        ? '—'
                        : `${inbound ? '+' : '-'}${formatUsd(t.amount)}`}
                    </p>
                    <a
                      href="#"
                      className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary"
                    >
                      {t.txHash.slice(0, 10)}…
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 text-2xl font-semibold tracking-tight',
          tone === 'in' && 'text-success',
        )}
      >
        {value}
      </p>
    </div>
  )
}