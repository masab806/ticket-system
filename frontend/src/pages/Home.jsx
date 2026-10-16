import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Hero } from '@/components/home/hero'
import { Features } from '@/components/home/features'
import { HowItWorks } from '@/components/home/how-it-works'
import { CtaBand } from '@/components/home/cta'
import { EventCard } from '@/components/event-card'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import api from '@/api/api'

export default function HomePage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/events', { params: { sort: 'trending' } })
      .then(({ data }) => setEvents(data.slice(0, 3)))
      .catch((error) => console.error('Failed to load home events:', error))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">On sale now</p>
              <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Trending events
              </h2>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight className="size-4" />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-primary" /></div>
          ) : events.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
              No events are available yet.
            </div>
          )}
        </section>

        <Features />
        <HowItWorks />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  )
}