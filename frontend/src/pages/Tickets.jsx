import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  CalendarDays,
  MapPin,
  QrCode as QrIcon,
  X,
  Send,
  Tag,
  ShieldCheck,
  Ticket as TicketIcon,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QrCode } from '@/components/qr-code'
import { myTickets } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const tabs = ['Upcoming', 'Listed', 'Past']

const statusMap = {
  Valid: { variant: 'success', label: 'Valid' },
  Listed: { variant: 'warning', label: 'Listed for resale' },
  Used: { variant: 'secondary', label: 'Used' },
}

export default function TicketsPage() {
  const [tab, setTab] = useState('Upcoming')
  const [active, setActive] = useState(null)

  const visible = myTickets.filter((t) => {
    if (tab === 'Upcoming') return t.status === 'Valid'
    if (tab === 'Listed') return t.status === 'Listed'
    return t.status === 'Used'
  })

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <TicketIcon className="size-4" />
              Wallet 0x9f2b…7d4a
            </div>
            <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              My tickets
            </h1>
            <p className="mt-2 text-muted-foreground">
              Your on-chain tickets, ready to scan, resell, or transfer.
            </p>
            <div className="mt-6 flex gap-1 rounded-xl border border-border bg-muted/50 p-1">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none',
                    tab === t
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {visible.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((ticket) => {
                const s = statusMap[ticket.status]
                return (
                  <div
                    key={ticket.id}
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                  >
                    <div className="relative aspect-[16/9]">
                      <img
                        src={ticket.image || '/placeholder.svg'}
                        alt={ticket.eventTitle}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute left-3 top-3">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </div>
                      <div className="absolute inset-x-3 bottom-3">
                        <p className="text-pretty font-semibold text-white">
                          {ticket.eventTitle}
                        </p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <p className="flex items-center gap-1.5">
                          <CalendarDays className="size-3.5" />
                          {ticket.date} · {ticket.time}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="size-3.5" />
                          {ticket.venue}, {ticket.city}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
                        <span className="font-medium">{ticket.tier}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {ticket.ticketId}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{ticket.seat}</p>

                      <div className="mt-4 flex gap-2">
                        <Button
                          className="flex-1 gap-1.5"
                          onClick={() => setActive(ticket)}
                          disabled={ticket.status === 'Used'}
                        >
                          <QrIcon className="size-4" />
                          Show
                        </Button>
                        <Button variant="outline" size="icon" aria-label="Transfer">
                          <Send className="size-4" />
                        </Button>
                        <Link to="/resale">
                          <Button variant="outline" size="icon" aria-label="List for resale">
                            <Tag className="size-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <p className="font-medium">Nothing here yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tickets in this category will appear here.
              </p>
              <Link to="/events" className="mt-5 inline-block">
                <Button>Browse events</Button>
              </Link>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />

      {active && <TicketModal ticket={active} onClose={() => setActive(null)} />}
    </div>
  )
}

function TicketModal({ ticket, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-primary px-5 py-3 text-primary-foreground">
          <span className="font-semibold">{ticket.eventTitle}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 hover:bg-primary-foreground/15"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5">
          <div className="mx-auto max-w-[220px]">
            <QrCode token={ticket.qrToken} />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Rotating secure token · scan at entry
          </p>

          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <Row label="Ticket ID" value={ticket.ticketId} mono />
            <Row label="Tier" value={ticket.tier} />
            <Row label="Seat" value={ticket.seat} />
            <Row label="Owner" value={ticket.owner} mono />
            <Row label="Tx hash" value={ticket.txHash} mono />
          </dl>

          <div className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-success/12 py-2 text-xs font-medium text-success">
            <ShieldCheck className="size-3.5" />
            Verified authentic on-chain
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  )
}