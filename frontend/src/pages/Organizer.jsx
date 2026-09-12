import { useState } from 'react'
import {
  LayoutDashboard,
  CalendarPlus,
  Users,
  Banknote,
  TrendingUp,
  Ticket,
  DollarSign,
  Repeat,
  Plus,
  ArrowUpRight,
  Settings2,
  Download,
  MoreHorizontal,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RevenueChart } from '@/components/organizer/revenue-chart'
import { organizerEvents, attendees, formatUsd } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const sections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'events', label: 'Events', icon: CalendarPlus },
  { id: 'attendees', label: 'Attendees', icon: Users },
  { id: 'payouts', label: 'Payouts', icon: Banknote },
]

export default function OrganizerPage() {
  const [section, setSection] = useState('overview')

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Organizer dashboard
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Metro Sports Group · Verified organizer
              </p>
            </div>
            <Button className="gap-2 self-start sm:self-auto">
              <Plus className="size-4" />
              Create event
            </Button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
            {/* Sidebar */}
            <aside>
              <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 lg:flex-col">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSection(s.id)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                      section === s.id
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <s.icon className="size-4" />
                    {s.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="min-w-0">
              {section === 'overview' && <Overview />}
              {section === 'events' && <Events />}
              {section === 'attendees' && <Attendees />}
              {section === 'payouts' && <Payouts />}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function Overview() {
  const kpis = [
    { label: 'Gross revenue', value: formatUsd(925700), delta: '+18.2%', icon: DollarSign },
    { label: 'Tickets sold', value: '6,322', delta: '+9.4%', icon: Ticket },
    { label: 'Avg. ticket price', value: formatUsd(146), delta: '+3.1%', icon: TrendingUp },
    { label: 'Resale volume', value: formatUsd(84200), delta: '+27.0%', icon: Repeat },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <k.icon className="size-4" />
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-success">
                <ArrowUpRight className="size-3" />
                {k.delta}
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{k.value}</p>
            <p className="text-sm text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Revenue</h2>
            <p className="text-sm text-muted-foreground">Last 6 months</p>
          </div>
          <Badge variant="success" className="gap-1">
            <TrendingUp className="size-3" />
            Trending up
          </Badge>
        </div>
        <div className="mt-6">
          <RevenueChart />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between p-5">
          <h2 className="font-semibold">Your events</h2>
          <span className="text-sm text-muted-foreground">{organizerEvents.length} total</span>
        </div>
        <EventTable events={organizerEvents.slice(0, 3)} />
      </div>
    </div>
  )
}

function Events() {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between p-5">
        <div>
          <h2 className="font-semibold">Manage events</h2>
          <p className="text-sm text-muted-foreground">Track sales and inventory per event.</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          New
        </Button>
      </div>
      <EventTable events={organizerEvents} />
    </div>
  )
}

function EventTable({ events }) {
  const statusVariant = {
    'On sale': 'success',
    'Sold out': 'secondary',
    Draft: 'warning',
    Past: 'secondary',
  }

  return (
    <div className="divide-y divide-border border-t border-border">
      {events.map((e) => {
        const pct = e.capacity ? Math.round((e.sold / e.capacity) * 100) : 0
        return (
          <div key={e.id} className="flex items-center gap-4 p-4">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
              <img
                src={e.image || '/placeholder.svg'}
                alt={e.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{e.title}</p>
                <Badge variant={statusVariant[e.status]}>{e.status}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {e.date} · {e.city}
              </p>
            </div>
            <div className="hidden w-40 sm:block">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{e.sold.toLocaleString()}</span>
                <span>{pct}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-brand-2"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <div className="hidden w-24 text-right md:block">
              <p className="font-semibold">{formatUsd(e.gross)}</p>
              <p className="text-xs text-muted-foreground">gross</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="More options">
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}

function Attendees() {
  const statusVariant = {
    Valid: 'success',
    'Checked in': 'secondary',
    Resold: 'warning',
  }
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between p-5">
        <div>
          <h2 className="font-semibold">Attendees</h2>
          <p className="text-sm text-muted-foreground">{attendees.length} ticket holders</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="size-4" />
          Export
        </Button>
      </div>
      <div className="overflow-x-auto border-t border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Wallet</th>
              <th className="px-5 py-3 font-medium">Event</th>
              <th className="px-5 py-3 font-medium">Tier</th>
              <th className="hidden px-5 py-3 font-medium sm:table-cell">Purchased</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3.5 font-mono text-xs">{a.wallet}</td>
                <td className="px-5 py-3.5">{a.event}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{a.tier}</td>
                <td className="hidden px-5 py-3.5 text-muted-foreground sm:table-cell">{a.purchased}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Payouts() {
  const payouts = [
    { id: 'p1', date: 'May 1, 2026', event: 'City Finals — Game 7', amount: 412300, status: 'Paid' },
    { id: 'p2', date: 'Apr 15, 2026', event: 'Aurora Nights', amount: 128900, status: 'Paid' },
    { id: 'p3', date: 'Apr 2, 2026', event: 'Pulse — Warehouse Rave', amount: 61200, status: 'Paid' },
  ]
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
          <p className="text-sm text-primary-foreground/80">Available to withdraw</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{formatUsd(184620)}</p>
          <Button className="mt-4 gap-2 bg-background text-foreground hover:bg-background/90">
            <Banknote className="size-4" />
            Withdraw to wallet
          </Button>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Settings2 className="size-4 text-primary" />
            <h2 className="font-semibold">Resale commission</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            You earn a royalty on every resale, enforced by the smart contract.
          </p>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border p-4">
            <span className="text-sm font-medium">Royalty rate</span>
            <span className="text-2xl font-semibold">8%</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Price cap: 120% of face value</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <h2 className="p-5 font-semibold">Payout history</h2>
        <div className="divide-y divide-border border-t border-border">
          {payouts.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4">
              <span className="flex size-10 items-center justify-center rounded-full bg-success/15 text-success">
                <Banknote className="size-5" />
              </span>
              <div className="flex-1">
                <p className="font-medium">{p.event}</p>
                <p className="text-xs text-muted-foreground">{p.date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatUsd(p.amount)}</p>
                <Badge variant="success">{p.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}