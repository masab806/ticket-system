import { useState } from 'react'
import {
  ShieldCheck,
  BadgeCheck,
  Gavel,
  Send,
  Tag,
  ArrowRight,
  Info,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { resaleListings, myTickets, formatUsd } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const tabs = ['Buy resale', 'Sell & transfer']

export default function ResalePage() {
  const [tab, setTab] = useState('Buy resale')

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Gavel className="size-4" />
              Secondary market
            </div>
            <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Resale & transfers
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Buy verified tickets from other fans or list your own. Smart
              contracts cap prices to keep resale fair.
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
          {tab === 'Buy resale' ? <BuyResale /> : <SellTransfer />}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function BuyResale() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {resaleListings.map((l) => {
        const overFace = l.listPrice > l.facePrice
        return (
          <div
            key={l.id}
            className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="relative size-28 shrink-0 overflow-hidden rounded-xl">
              <img
                src={l.image || '/placeholder.svg'}
                alt={l.eventTitle}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{l.eventTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.date} · {l.city}
                  </p>
                </div>
                <Badge variant="secondary">{l.category}</Badge>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{l.tier}</span>
                <span>{l.seat}</span>
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-xs">
                {l.verified ? (
                  <span className="inline-flex items-center gap-1 text-success">
                    <BadgeCheck className="size-3.5" />
                    Verified seller
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Info className="size-3.5" />
                    New seller
                  </span>
                )}
                <span className="font-mono text-muted-foreground">· {l.seller}</span>
              </div>

              <div className="mt-auto flex items-end justify-between pt-3">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold">{formatUsd(l.listPrice)}</span>
                    {overFace && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatUsd(l.facePrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Cap {formatUsd(l.priceCap)}
                  </p>
                </div>
                <Button className="gap-1.5">
                  Buy now
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SellTransfer() {
  const sellable = myTickets.filter((t) => t.status !== 'Used')
  const [selected, setSelected] = useState(sellable[0]?.id ?? '')

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div>
        <h2 className="text-lg font-semibold">Choose a ticket</h2>
        <p className="text-sm text-muted-foreground">Select which ticket you want to list or transfer.</p>
        <div className="mt-4 space-y-3">
          {sellable.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all',
                selected === t.id
                  ? 'border-primary bg-accent/60 ring-1 ring-primary/20'
                  : 'border-border hover:border-primary/40',
              )}
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg">
                <img
                  src={t.image || '/placeholder.svg'}
                  alt={t.eventTitle}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{t.eventTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {t.tier} · {t.seat}
                </p>
              </div>
              {t.status === 'Listed' && <Badge variant="warning">Listed</Badge>}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Tag className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">List for resale</h3>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium">Asking price</span>
            <Input placeholder="$0" inputMode="numeric" defaultValue="165" />
          </label>
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-warning/15 p-3 text-xs text-warning-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Price cap is 120% of face value ($179). Listings above the cap are
            blocked by the contract.
          </div>
          <Button size="lg" className="mt-4 h-11 w-full">List ticket</Button>

          <div className="my-6 h-px bg-border" />

          <div className="flex items-center gap-2">
            <Send className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">Transfer to a friend</h3>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium">Recipient wallet or email</span>
            <Input placeholder="0x… or name@email.com" />
          </label>
          <Button size="lg" variant="outline" className="mt-4 h-11 w-full gap-1.5">
            <Send className="size-4" />
            Send ticket
          </Button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-success" />
            Ownership updates on-chain instantly
          </p>
        </div>
      </div>
    </div>
  )
}