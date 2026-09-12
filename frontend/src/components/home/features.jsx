import { ShieldCheck, Repeat, QrCode, Gauge, Lock, BadgeCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'

const features = [
  {
    icon: ShieldCheck,
    title: 'Counterfeit-proof',
    body: 'Ownership lives on the blockchain. No screenshots, no duplicates, no fakes at the door.',
  },
  {
    icon: Repeat,
    title: 'Fair resale',
    body: 'Price-capped resale enforced by smart contract keeps scalpers out and fans in.',
  },
  {
    icon: QrCode,
    title: 'Instant e-tickets',
    body: 'A dynamic QR code with a rotating secure token — validated live at entry.',
  },
  {
    icon: Gauge,
    title: 'Instant transfers',
    body: 'Send a ticket to a friend in seconds. Ownership updates on-chain immediately.',
  },
  {
    icon: Lock,
    title: 'Self-custody optional',
    body: 'Connect your own wallet or let Tessera custody it for you. Your call.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified organizers',
    body: 'Only vetted organizers can mint. Look for the verified badge on every listing.',
  },
]

export function Features() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-primary">Why Tessera</p>
        <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          The ticket stack built for trust
        </h2>
        <p className="mt-3 text-pretty text-lg text-muted-foreground">
          Everything you expect from a modern marketplace, secured by the parts
          you can&apos;t see.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title} className="p-6 transition-colors hover:border-primary/40">
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <f.icon className="size-5" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.body}
            </p>
          </Card>
        ))}
      </div>
    </section>
  )
}
