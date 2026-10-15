import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative isolate min-h-[650px] overflow-hidden bg-[#07111e] sm:min-h-[720px]">
      {/* Background image */}
      <div className="absolute inset-0 -z-20">
        <img
          src="/hero-crowd.png"
          alt=""
          className="h-full w-full object-cover object-center opacity-50"
          aria-hidden="true"
        />
      </div>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#07111e] via-[#07111e]/90 to-[#07111e]/35" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#07111e] via-transparent to-[#07111e]/40" />

      {/* Ambient lighting */}
      <div className="pointer-events-none absolute -right-24 top-16 -z-10 h-80 w-80 rounded-full bg-cyan-400/15 blur-[100px] sm:h-[460px] sm:w-[460px]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 -z-10 h-72 w-72 rounded-full bg-sky-500/10 blur-[100px]" />

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.35) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'linear-gradient(to bottom, black, transparent 90%)',
        }}
      />

      <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-14 px-5 py-20 sm:min-h-[720px] sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-24">
        {/* Main content */}
        <div className="max-w-3xl">
          <div className="inline-flex animate-[fadeIn_0.7s_ease-out_both] items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-4 py-2 text-xs font-medium tracking-wide text-cyan-100 shadow-[0_0_35px_rgba(34,211,238,0.07)] backdrop-blur-xl sm:text-sm">
            <Sparkles className="size-4 text-cyan-300" />
            THE NEXT GENERATION OF TICKETING
            <span className="ml-1 size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" />
          </div>

          <h1 className="mt-8 max-w-3xl animate-[fadeIn_0.8s_ease-out_0.1s_both] text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl md:text-7xl lg:text-[5.4rem]">
            Your ticket.
            <br />
            <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-white bg-clip-text text-transparent">
              Your ownership.
            </span>
            <br />
            <span className="text-white/85">Your moment.</span>
          </h1>

          <p className="mt-7 max-w-xl animate-[fadeIn_0.8s_ease-out_0.2s_both] text-base leading-8 text-slate-300 sm:text-lg">
            Discover unforgettable events with blockchain-secured tickets.
            Buy, own, and resell with confidence — every ticket has a story
            that belongs to you.
          </p>

          <div className="mt-9 flex animate-[fadeIn_0.8s_ease-out_0.3s_both] flex-col gap-3 sm:flex-row">
            <Link to="/events">
              <Button
                size="lg"
                className="group h-13 w-full gap-3 rounded-xl border border-cyan-200/30 bg-cyan-300 px-7 text-base font-semibold text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.16)] transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-200 hover:shadow-[0_0_45px_rgba(34,211,238,0.28)] sm:w-auto"
              >
                Explore events
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link to="/verify">
              <Button
                size="lg"
                variant="outline"
                className="h-13 w-full gap-3 rounded-xl border-white/15 bg-white/[0.04] px-7 text-base text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200/40 hover:bg-white/[0.09] hover:text-cyan-100 sm:w-auto"
              >
                <Search className="size-4" />
                Verify a ticket
                <ArrowUpRight className="size-4 opacity-60" />
              </Button>
            </Link>
          </div>

          {/* Trust indicator */}
          <div className="mt-9 flex items-center gap-3 text-sm text-slate-400">
            <div className="flex size-9 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-300/[0.08]">
              <ShieldCheck className="size-4 text-emerald-300" />
            </div>
            <div>
              <p className="font-medium text-slate-200">
                Ownership secured on-chain
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Transparent. Verifiable. Yours.
              </p>
            </div>
          </div>
        </div>

        {/* Stats panel */}
        <div className="relative hidden animate-[fadeIn_1s_ease-out_0.25s_both] lg:block">
          <div className="absolute -inset-8 rounded-[2rem] bg-cyan-300/[0.07] blur-3xl" />

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1928]/75 p-7 shadow-2xl shadow-black/30 backdrop-blur-2xl xl:p-9">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Built for real moments
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Trust, by design.
                </h2>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-300/10">
                <ShieldCheck className="size-5 text-cyan-200" />
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {[
                {
                  number: '01',
                  title: 'Verified ownership',
                  description: 'Every ticket can be verified on-chain.',
                },
                {
                  number: '02',
                  title: 'Transparent resales',
                  description: 'Clear ownership and resale history.',
                },
                {
                  number: '03',
                  title: 'Secure entry',
                  description: 'Designed for reliable ticket verification.',
                },
              ].map((item) => (
                <div
                  key={item.number}
                  className="group flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 transition-all duration-300 hover:border-cyan-200/20 hover:bg-cyan-200/[0.04]"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-cyan-200/15 bg-cyan-200/[0.06] text-xs font-semibold text-cyan-200">
                    {item.number}
                  </span>
                  <div>
                    <h3 className="font-medium text-slate-100">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">
                      {item.description}
                    </p>
                  </div>
                  <ArrowUpRight className="ml-auto size-4 shrink-0 text-slate-500 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-200" />
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-5">
              <span className="text-xs text-slate-400">
                Powered by blockchain technology
              </span>
              <span className="flex items-center gap-2 text-xs font-medium text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-300" />
                On-chain
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
