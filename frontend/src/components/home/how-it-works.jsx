import { Wallet, MousePointerClick, CreditCard, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const steps = [
  {
    icon: Wallet,
    title: 'Connect',
    body: 'Link a wallet or sign in with email. We create a secure custody wallet for you instantly.',
  },
  {
    icon: MousePointerClick,
    title: 'Choose',
    body: 'Browse events, pick your tier and seats. Your selection is held while you check out.',
  },
  {
    icon: CreditCard,
    title: 'Pay',
    body: 'Pay with card or crypto. The moment payment clears, your ticket is minted on-chain.',
  },
  {
    icon: Sparkles,
    title: 'Own it',
    body: 'Your e-ticket lands in your wallet — ready to scan, resell, or transfer anytime.',
  },
]

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">How it works</p>
            <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              From wallet to the front row in four steps
            </h2>
          </div>
          <Link to="/events">
            <Button variant="outline" className="gap-2">
              Start browsing
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>

        <ol className="mt-12 grid gap-4 md:grid-cols-4">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-border bg-background p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <step.icon className="size-5" />
              </span>
              <span className="absolute right-5 top-5 font-mono text-sm text-muted-foreground">
                0{i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
