import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, TrendingUp, Link2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatUsd } from '@/lib/mock-data'

export function EventCard({ event }) {
  if (!event) return null

  // Routing fallback: use slug, _id, or id
const eventId = event._id || event.id || event.slug

// Safe string & image extractions
  const title = event?.title || event?.name || 'Untitled Event'
  const image = event?.image || '/placeholder.svg'
  const category = event?.category || 'General'
  const chain = event?.chain || 'Ethereum'
  const isTrending = Boolean(event?.trending)

  // Date and Time formatting with ISO string fallback
  const dateStr = event?.date
    ? (isNaN(new Date(event.date).getTime()) ? event.date : new Date(event.date).toLocaleDateString())
    : (event?.startsAt ? new Date(event.startsAt).toLocaleDateString() : 'TBA')

  const timeStr = event?.time || (event?.startsAt ? new Date(event.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBA')

  // Nested object or string checks for venue/city
  const venueStr = typeof event?.venue === 'object' ? (event?.venue?.name || 'Venue TBA') : (event?.venue || 'Venue TBA')
  const cityStr = typeof event?.city === 'object' ? (event?.city?.name || event?.city?.country || 'Unspecified') : (event?.city || 'Unspecified')

  // Calculate percentage sold if not directly passed
  const soldPct = event?.soldPct ?? (
    event?.totalTickets
      ? Math.min(100, Math.round(((event?.mintedTickets || 0) / event.totalTickets) * 100))
      : 0
  )

  // Calculate starting price fallback (checks priceFrom, lowest tier price, ticketPrice, or default 0)
  const priceFrom = event?.priceFrom ?? (
    Array.isArray(event?.tiers) && event.tiers.length > 0
      ? Math.min(...event.tiers.map((t) => t.price ?? 0))
      : (event?.ticketPrice ?? 0)
  )

  return (
    <Link
      to={eventId ? `/events/${eventId}` : '#'}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur">
            {category}
          </Badge>
          {isTrending && (
            <Badge className="bg-primary/90 backdrop-blur">
              <TrendingUp className="size-3" />
              Trending
            </Badge>
          )}
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur">
            <Link2 className="size-3 text-primary" />
            {chain}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-pretty text-base font-semibold leading-snug transition-colors group-hover:text-primary">
          {title}
        </h3>
        <div className="mt-2.5 space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {dateStr} · {timeStr}
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {venueStr}, {cityStr}
          </p>
        </div>

        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-brand-2"
              style={{ width: `${soldPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {soldPct}% sold
          </p>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="text-lg font-semibold">
              {formatUsd ? formatUsd(priceFrom) : `$${priceFrom}`}
            </p>
          </div>
          <span className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            Get tickets
          </span>
        </div>
      </div>
    </Link>
  )
}

export default EventCard