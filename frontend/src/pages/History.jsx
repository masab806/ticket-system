import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  ExternalLink,
  Loader2,
  Receipt,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import api from '@/api/api'
import { useAuth } from '@/context/AuthContext'

const filters = ['All', 'Purchase']

function formatAmount(value, currency = 'USD') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

export default function HistoryPage() {
  const [filter, setFilter] = useState('All')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuth()

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    api.get('/payments/history', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(({ data }) => setTransactions(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load transaction history.'))
      .finally(() => setLoading(false))
  }, [token])

  const visible = transactions.filter((transaction) =>
    filter === 'All' || transaction.type === filter
  )
  const spent = transactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0)

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
              Your Stripe payments and ticket purchase records.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Stat label="Total spent" value={formatAmount(spent)} />
              <Stat label="Successful payments" value={String(transactions.filter((t) => t.status === 'Confirmed').length)} />
              <Stat label="Transactions" value={String(transactions.length)} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm font-medium',
                  filter === item
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                {item}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">{error}</div>
          ) : !token ? (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">Sign in to view your history.</div>
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground">No transactions yet.</div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {visible.map((transaction, index) => (
                <div key={transaction.id} className={cn('flex items-center gap-4 p-4', index !== visible.length - 1 && 'border-b border-border')}>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <ArrowUpRight className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{transaction.event}</p>
                      <Badge variant={transaction.status === 'Confirmed' ? 'success' : 'warning'}>{transaction.status}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Purchase · {new Date(transaction.date).toLocaleString()} · {transaction.quantity} ticket(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">-{formatAmount(transaction.amount, transaction.currency)}</p>
                    <span className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                      {transaction.txHash.slice(0, 12)}…
                      <ExternalLink className="size-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}
