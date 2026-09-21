import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
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
import api from '@/api/api'

export function EventDetail() {
  const { id } = useParams()

  const [eventData, setEventData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [tierId, setTierId] = useState('general')
  const [qty, setQty] = useState(1)
  const [seats, setSeats] = useState(new Set())

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get(`/events/${id}`)

        setEventData(response.data)
      } catch (err) {
        console.error('Failed to fetch event details:', err)

        setError(
          err.response?.data?.message ||
          'Failed to fetch event'
        )
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchEvent()
    }
  }, [id])

  const event = eventData

  const tiers = useMemo(() => {
    if (!event) {
      return []
    }

    if (Array.isArray(event.tiers) && event.tiers.length > 0) {
      return event.tiers
    }

    const defaultPrice =
      event.ticketPrice ?? event.priceFrom ?? 0

    const remainingCount =
      (event.totalTickets ?? 100) -
      (event.mintedTickets ?? 0)

    return [
      {
        id: 'general',
        name: 'General Admission',
        price: defaultPrice,
        fee: Math.round(defaultPrice * 0.05),
        remaining: Math.max(0, remainingCount),
        total: event.totalTickets ?? 100,
        perks: [
          'Standard Entry',
          'Digital Ticket NFT',
        ],
      },
    ]
  }, [event])

  useEffect(() => {
    if (tiers.length > 0) {
      const tierExists = tiers.some(
        (tier) => tier.id === tierId
      )

      if (!tierExists) {
        setTierId(tiers[0].id)
      }
    }
  }, [tiers, tierId])

  const tier =
    tiers.find((t) => t.id === tierId) ||
    tiers[0]

  const isReserved = Boolean(
    tier?.name?.toLowerCase().includes('reserved') ||
    tier?.name?.toLowerCase().includes('seat') ||
    ['lower', 'club', 'orchestra', 'court', 'box', 'balcony'].includes(
      tier?.id
    )
  )

  const effectiveQty = isReserved
    ? seats.size
    : qty

  const subtotal =
    (tier?.price || 0) * effectiveQty

  const fees =
    (tier?.fee || 0) * effectiveQty

  const total = subtotal + fees

  const title =
    event?.title ||
    event?.name ||
    'Untitled Event'

  const image =
    event?.image ||
    '/placeholder.svg'

  const category =
    event?.category ||
    'General'

  const chain =
    event?.chain ||
    'Ethereum'

  const isTrending =
    Boolean(event?.trending)

  const description =
    event?.description ||
    'No description provided.'

  const dateStr = event?.date
    ? (
        isNaN(new Date(event.date).getTime())
          ? event.date
          : new Date(event.date).toLocaleDateString()
      )
    : (
        event?.startsAt
          ? new Date(event.startsAt).toLocaleDateString()
          : 'TBA'
      )

  const timeStr =
    event?.time ||
    (
      event?.startsAt
        ? new Date(event.startsAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'TBA'
    )

  const venueStr =
    typeof event?.venue === 'object'
      ? event?.venue?.name || 'Venue TBA'
      : event?.venue || 'Venue TBA'

  const cityStr =
    typeof event?.city === 'object'
      ? event?.city?.name ||
        event?.city?.country ||
        'Unspecified'
      : event?.city || 'Unspecified'

  const organizerName =
    typeof event?.organizer === 'object'
      ? event?.organizer?.name ||
        event?.organizer?.username ||
        'Organizer'
      : event?.organizer ||
        'Organizer'

  const organizerVerified =
    Boolean(event?.organizerVerified)

  const soldPct =
    event?.soldPct ??
    (
      event?.totalTickets
        ? Math.round(
            ((event?.mintedTickets || 0) /
              event.totalTickets) *
              100
          )
        : 0
    )

  const toggleSeat = (seatId) => {
    setSeats((prev) => {
      const next = new Set(prev)

      if (next.has(seatId)) {
        next.delete(seatId)
      } else {
        next.add(seatId)
      }

      return next
    })
  }

  const summary = useMemo(
    () => ({
      eventId: event?.id || event?._id,
      eventTitle: title,
      tierName: tier?.name,
      tierId: tier?.id,
      qty: effectiveQty,
      seats: [...seats],
      subtotal,
      fees,
      total,
    }),
    [
      event,
      title,
      tier,
      effectiveQty,
      seats,
      subtotal,
      fees,
      total,
    ]
  )

  const canCheckout =
    effectiveQty > 0

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-lg font-medium">
          Loading event details...
        </p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-lg font-medium text-destructive">
          {error
            ? `Failed to load event: ${error}`
            : 'Event details not found.'}
        </p>

        <Link
          to="/events"
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          Back to all events
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="relative h-[42vh] min-h-[320px] w-full overflow-hidden">
        <img
          src={image}
          alt={title}
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
              <Badge>{category}</Badge>

              <Badge variant="secondary" className="gap-1">
                <Link2 className="size-3 text-primary" />
                {chain}
              </Badge>

              {isTrending && (
                <Badge variant="warning">
                  Trending
                </Badge>
              )}
            </div>

            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              {title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {dateStr}
              </span>

              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {timeStr}
              </span>

              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {venueStr}, {cityStr}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-8">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <span className="flex size-11 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">
                {organizerName.charAt(0).toUpperCase()}
              </span>

              <div>
                <p className="text-xs text-muted-foreground">
                  Organized by
                </p>

                <p className="flex items-center gap-1.5 font-medium">
                  {organizerName}

                  {organizerVerified && (
                    <BadgeCheck className="size-4 text-primary" />
                  )}
                </p>
              </div>

              <span className="ml-auto flex items-center gap-1.5 rounded-full bg-success/12 px-3 py-1 text-xs font-medium text-success">
                <ShieldCheck className="size-3.5" />
                {soldPct}% sold
              </span>
            </div>

            <section>
              <h2 className="text-xl font-semibold">
                About this event
              </h2>

              <p className="mt-3 leading-relaxed text-muted-foreground">
                {description}
              </p>
            </section>

            {event.lineup?.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold">
                  Lineup & highlights
                </h2>

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

                  <h2 className="text-xl font-semibold">
                    Select your seats
                  </h2>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Choose seats for the {tier.name} section.
                </p>

                <div className="mt-4">
                  <SeatMap
                    selected={seats}
                    onToggle={toggleSeat}
                  />
                </div>
              </section>
            )}
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">
                Select ticket type
              </p>

              <div className="mt-3 space-y-2.5">
                {tiers.map((t) => {
                  const active =
                    t.id === tierId

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
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {t.name}
                        </span>

                        <span className="font-semibold">
                          {formatUsd
                            ? formatUsd(t.price)
                            : `$${t.price}`}
                        </span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {t.perks
                          ?.slice(0, 3)
                          .map((p) => (
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
                          t.remaining < 20
                            ? 'text-destructive'
                            : 'text-muted-foreground'
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
                  <span className="text-sm font-medium">
                    Quantity
                  </span>

                  <div className="flex items-center gap-3">
                    <Button
                      size="icon-sm"
                      variant="outline"
                      onClick={() =>
                        setQty((q) =>
                          Math.max(1, q - 1)
                        )
                      }
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </Button>

                    <span className="w-5 text-center font-semibold">
                      {qty}
                    </span>

                    <Button
                      size="icon-sm"
                      variant="outline"
                      onClick={() =>
                        setQty((q) =>
                          Math.min(8, q + 1)
                        )
                      }
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-border p-3 text-sm">
                  <span className="font-medium">
                    Selected seats
                  </span>

                  <p className="mt-1 text-muted-foreground">
                    {seats.size > 0
                      ? [...seats].join(', ')
                      : 'None yet — pick from the map'}
                  </p>
                </div>
              )}

              <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Subtotal (
                    {effectiveQty} ×{' '}
                    {formatUsd
                      ? formatUsd(tier?.price || 0)
                      : `$${tier?.price || 0}`}
                    )
                  </dt>

                  <dd>
                    {formatUsd
                      ? formatUsd(subtotal)
                      : `$${subtotal}`}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Service fee
                  </dt>

                  <dd>
                    {formatUsd
                      ? formatUsd(fees)
                      : `$${fees}`}
                  </dd>
                </div>

                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                  <dt>Total</dt>

                  <dd>
                    {formatUsd
                      ? formatUsd(total)
                      : `$${total}`}
                  </dd>
                </div>
              </dl>

              <Link
                to={
                  canCheckout
                    ? '/checkout'
                    : '#'
                }
                state={{ summary }}
                aria-disabled={!canCheckout}
                className={cn(
                  !canCheckout &&
                    'pointer-events-none'
                )}
              >
                <Button
                  size="lg"
                  className="mt-4 h-12 w-full text-base"
                  disabled={!canCheckout}
                >
                  {canCheckout
                    ? 'Continue to checkout'
                    : 'Select seats to continue'}
                </Button>
              </Link>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-success" />
                Minted on {chain} · fully transferable
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetail