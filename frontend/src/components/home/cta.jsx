import { Link } from 'react-router-dom'
import { ArrowRight, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CtaBand() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-primary-foreground sm:px-16">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-primary-foreground/10 blur-2xl" />
        <div className="absolute -bottom-20 left-10 size-72 rounded-full bg-brand-2/30 blur-3xl" />
        <div className="relative max-w-2xl">
          <Ticket className="size-10" />
          <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Hosting an event? Mint tickets that sell themselves.
          </h2>
          <p className="mt-4 text-pretty text-lg text-primary-foreground/80">
            Launch on-chain ticketing in minutes, set your own resale rules, and
            watch real-time sales roll in — with payouts you control.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/organizer">
              <Button
                size="lg"
                className="h-12 w-full gap-2 bg-background px-6 text-base text-foreground hover:bg-background/90 sm:w-auto"
              >
                Open organizer dashboard
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/events">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full border-primary-foreground/30 bg-transparent px-6 text-base text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
              >
                See live events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}