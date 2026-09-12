import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/hero-crowd.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-sm font-medium shadow-sm backdrop-blur">
            <ShieldCheck className="size-4 text-success" />
            Every ticket verified on-chain
          </div>
          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Tickets you truly own. Fraud you never face.
          </h1>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            Tessera mints every ticket as a secure on-chain asset — so buying,
            reselling, and transferring is instant, transparent, and impossible
            to counterfeit.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/events">
              <Button size="lg" className="h-12 w-full gap-2 px-6 text-base sm:w-auto">
                Explore events
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/verify">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full gap-2 px-6 text-base sm:w-auto"
              >
                <Search className="size-4" />
                Verify a ticket
              </Button>
            </Link>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
            {[
              { value: '2.4M+', label: 'Tickets minted' },
              { value: '$0', label: 'Fraud losses' },
              { value: '180+', label: 'Verified venues' },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}