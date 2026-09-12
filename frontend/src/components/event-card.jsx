import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, TrendingUp, Link2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatUsd } from '@/lib/mock-data'

export function EventCard({ event }) {
  return (
    <Link
      to={`/events/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={event.image || '/placeholder.svg'}
          alt={event.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur">
            {event.category}
          </Badge>
          {event.trending && (
            <Badge className="bg-primary/90 backdrop-blur">
              <TrendingUp className="size-3" />
              Trending
            </Badge>
          )}
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur">
            <Link2 className="size-3 text-primary" />
            {event.chain}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-pretty text-base font-semibold leading-snug transition-colors group-hover:text-primary">
          {event.title}
        </h3>
        <div className="mt-2.5 space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {event.date} · {event.time}
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {event.venue}, {event.city}
          </p>
        </div>

        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-brand-2"
              style={{ width: `${event.soldPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {event.soldPct}% sold
          </p>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="text-lg font-semibold">{formatUsd(event.priceFrom)}</p>
          </div>
          <span className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            Get tickets
          </span>
        </div>
      </div>
    </Link>
  )
}

export default EventCard;