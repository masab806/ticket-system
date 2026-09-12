import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'

// Adjust these relative paths based on your project structure
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import EventCard from '@/components/event-card'
import { Input } from '@/components/ui/input'
import { events, categories } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const sorts = [
  { id: 'trending', label: 'Trending' },
  { id: 'priceLow', label: 'Price: Low to High' },
  { id: 'priceHigh', label: 'Price: High to Low' },
]

export default function EventsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('trending')

  const filtered = useMemo(() => {
    let list = events.filter((e) => {
      const matchesQuery =
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        e.city.toLowerCase().includes(query.toLowerCase()) ||
        e.venue.toLowerCase().includes(query.toLowerCase())
      const matchesCat = category === 'All' || e.category === category
      return matchesQuery && matchesCat
    })
    if (sort === 'priceLow') list = [...list].sort((a, b) => a.priceFrom - b.priceFrom)
    if (sort === 'priceHigh') list = [...list].sort((a, b) => b.priceFrom - a.priceFrom)
    if (sort === 'trending')
      list = [...list].sort((a, b) => Number(b.trending) - Number(a.trending) || b.soldPct - a.soldPct)
    return list
  }, [query, category, sort])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Browse events
            </h1>
            <p className="mt-2 max-w-xl text-pretty text-muted-foreground">
              Discover verified, on-chain events near you. Every listing is
              backed by a smart contract.
            </p>

            <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events, venues, cities…"
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-10 bg-transparent pr-2 text-sm font-medium outline-none"
                >
                  {sorts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {['All', ...categories].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                    category === cat
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="mb-6 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'event' : 'events'}
          </p>
          {filtered.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <p className="font-medium">No events found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}