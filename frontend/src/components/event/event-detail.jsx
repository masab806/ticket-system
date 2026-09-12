import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Clock,
  BadgeCheck,
  Link2,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  Armchair,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SeatMap } from '@/components/event/seat-map'
import { formatUsd } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function EventDetail({ event }) {
  // Early return guard to handle loading states or missing event object
  if (!event || !event.tiers || event.tiers.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-lg font-medium">Event details not found.</p>
        <Link to="/events" className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="size-4" />
          Back to all events
        </Link>
      </div>
    )
  }

  const [tierId, setTierId] = useState(event.tiers[0].id)
  const [qty, setQty] = useState(1)
  const [seats, setSeats] = useState(new Set())

  const tier = event.tiers.find((t) => t.id === tierId) ?? event.tiers[0]
  const isReserved =
    tier.name.toLowerCase().includes('reserved') ||
    tier.name.toLowerCase().includes('seat') ||
    ['lower', 'club', 'orchestra', 'court', 'box', 'balcony'].includes(tier.id)

  const effectiveQty = isReserved ? seats.size || 0 : qty
  const subtotal = (tier.price || 0) * effectiveQty
  const fees = (tier.fee || 0) * effectiveQty
  const total = subtotal + fees

  const toggleSeat = (id) => {
    setSeats((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const summary = useMemo(
    () => ({
      event: event.title,
      tier: tier.name,
      qty: effectiveQty,
      seats: [...seats].join(', '),
      total,
    }),
    [event.title, tier.name, effectiveQty, seats, total],
  )

  const canCheckout = effectiveQty > 0

  return (
    <div>
      <div className="relative h-[42vh] min-h-[320px] w-full overflow-hidden">
        <img
          src={event.image || '/placeholder.svg'}
          alt={event.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
            <Link
              to="/events"
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to events
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{event.category}</Badge>
              <Badge variant="secondary" className="gap-1">
                <Link2 className="size-3 text-primary" />
                {event.chain}
              </Badge>
              {event.trending && <Badge variant="warning">Trending</Badge>}
            </div>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              {event.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {event.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {event.time}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {event.venue}, {event.city}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-8">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold">
                {event.organizer?.charAt(0)}
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Organized by</p>
                <p className="flex items-center gap-1.5 font-medium">
                  {event.organizer}
                  {event.organizerVerified && (
                    <BadgeCheck className="size-4 text-primary" />
                  )}
                </p>
              </div>
              <span className="ml-auto flex items-center gap-1.5 rounded-full bg-success/12 px-3 py-1 text-xs font-medium text-success">
                <ShieldCheck className="size-3.5" />
                {event.soldPct}% sold
              </span>
            </div>

            <section>
              <h2 className="text-xl font-semibold">About this event</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            </section>

            {event.lineup?.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold">Lineup & highlights</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {event.lineup.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {isReserved && (
              <section>
                <div className="flex items-center gap-2">
                  <Armchair className="size-5 text-primary" />
                  <h2 className="text-xl font-semibold">Select your seats</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose seats for the {tier.name} section.
                </p>
                <div className="mt-4">
                  <SeatMap selected={seats} onToggle={toggleSeat} />
                </div>
              </section>
            )}
          </div>

          {/* Order card */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Select ticket type</p>
              <div className="mt-3 space-y-2.5">
                {event.tiers.map((t) => {
                  const active = t.id === tierId
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTierId(t.id)
                        setSeats(new Set())
                        setQty(1)
                      }}
                      className={cn(
                        'w-full rounded-xl border p-3.5 text-left transition-all',
                        active
                          ? 'border-primary bg-accent/60 ring-1 ring-primary/20'
                          : 'border-border hover:border-primary/40',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{t.name}</span>
                        <span className="font-semibold">{formatUsd(t.price)}</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {t.perks?.slice(0, 3).map((p) => (
                          <span
                            key={p}
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                          >
                            <Check className="size-3 text-success" />
                            {p}
                          </span>
                        ))}
                      </div>
                      <p
                        className={cn(
                          'mt-2 text-xs',
                          t.remaining < 20 ? 'text-destructive' : 'text-muted-foreground',
                        )}
                      >
                        {t.remaining} of {t.total} remaining
                      </p>
                    </button>
                  )
                })}
              </div>

              {!isReserved ? (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-border p-3">
                  <span className="text-sm font-medium">Quantity</span>
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon-sm"
                      variant="outline"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-5 text-center font-semibold">{qty}</span>
                    <Button
                      size="icon-sm"
                      variant="outline"
                      onClick={() => setQty((q) => Math.min(8, q + 1))}
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-border p-3 text-sm">
                  <span className="font-medium">Selected seats</span>
                  <p className="mt-1 text-muted-foreground">
                    {seats.size > 0 ? [...seats].join(', ') : 'None yet — pick from the map'}
                  </p>
                </div>
              )}

              <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Subtotal ({effectiveQty} × {formatUsd(tier.price)})
                  </dt>
                  <dd>{formatUsd(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Service fee</dt>
                  <dd>{formatUsd(fees)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                  <dt>Total</dt>
                  <dd>{formatUsd(total)}</dd>
                </div>
              </dl>

              <Link
                to={canCheckout ? '/checkout' : '#'}
                aria-disabled={!canCheckout}
                className={cn(!canCheckout && 'pointer-events-none')}
              >
                <Button size="lg" className="mt-4 h-12 w-full text-base" disabled={!canCheckout}>
                  {canCheckout ? 'Continue to checkout' : 'Select seats to continue'}
                </Button>
              </Link>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-success" />
                Minted on {event.chain} · fully transferable
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetail