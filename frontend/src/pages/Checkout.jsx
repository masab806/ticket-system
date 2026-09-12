import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  ShieldCheck,
  Lock,
  Check,
  Loader2,
  Sparkles,
  Download,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { QrCode } from '@/components/qr-code'
import { events, formatUsd } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const order = {
  event: events[0],
  tier: 'VIP Front Stage',
  seat: 'Sec A · Row 2 · Seat 14',
  qty: 1,
  price: 329,
  fee: 18,
}

export default function CheckoutPage() {
  const [method, setMethod] = useState('card')
  const [stage, setStage] = useState('form')
  const total = order.price * order.qty + order.fee * order.qty

  const pay = () => {
    setStage('minting')
    setTimeout(() => setStage('done'), 2200)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          {stage !== 'done' ? (
            <>
              <Link
                to={`/events/${order.event.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Back to event
              </Link>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">Checkout</h1>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
                {/* Left: payment */}
                <div className="space-y-6">
                  <section className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold">Payment method</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        { id: 'card', label: 'Card', icon: CreditCard, hint: 'Visa, Mastercard, Amex' },
                        { id: 'crypto', label: 'Crypto wallet', icon: Wallet, hint: 'USDC, ETH on Base' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMethod(m.id)}
                          className={cn(
                            'flex items-start gap-3 rounded-xl border p-4 text-left transition-all',
                            method === m.id
                              ? 'border-primary bg-accent/60 ring-1 ring-primary/20'
                              : 'border-border hover:border-primary/40',
                          )}
                        >
                          <m.icon className="mt-0.5 size-5 text-primary" />
                          <div>
                            <p className="font-medium">{m.label}</p>
                            <p className="text-xs text-muted-foreground">{m.hint}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {method === 'card' ? (
                      <div className="mt-5 grid gap-4">
                        <Field label="Cardholder name">
                          <Input placeholder="Alex Rivera" />
                        </Field>
                        <Field label="Card number">
                          <Input placeholder="4242 4242 4242 4242" inputMode="numeric" />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Expiry">
                            <Input placeholder="MM / YY" />
                          </Field>
                          <Field label="CVC">
                            <Input placeholder="123" inputMode="numeric" />
                          </Field>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-xl border border-dashed border-border p-5 text-center">
                        <Wallet className="mx-auto size-8 text-primary" />
                        <p className="mt-2 font-medium">Connect your wallet to pay</p>
                        <p className="text-sm text-muted-foreground">
                          Pay in USDC or ETH. Gas is sponsored by Tessera.
                        </p>
                        <Button className="mt-4 gap-2">
                          <Wallet className="size-4" />
                          Connect wallet
                        </Button>
                      </div>
                    )}
                  </section>

                  <section className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold">Delivery</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your on-chain ticket is delivered instantly to your wallet and email.
                    </p>
                    <div className="mt-4">
                      <Field label="Email">
                        <Input type="email" placeholder="you@example.com" />
                      </Field>
                    </div>
                  </section>
                </div>

                {/* Right: summary */}
                <div className="lg:sticky lg:top-20 lg:self-start">
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex gap-3">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={order.event.image || '/placeholder.svg'}
                          alt={order.event.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold leading-tight">{order.event.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {order.event.date} · {order.event.city}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 rounded-xl bg-muted/60 p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tier</span>
                        <span className="font-medium">{order.tier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Seat</span>
                        <span className="font-medium">{order.seat}</span>
                      </div>
                    </div>

                    <dl className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Ticket ({order.qty})</dt>
                        <dd>{formatUsd(order.price * order.qty)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Service fee</dt>
                        <dd>{formatUsd(order.fee * order.qty)}</dd>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                        <dt>Total</dt>
                        <dd>{formatUsd(total)}</dd>
                      </div>
                    </dl>

                    <Button
                      size="lg"
                      className="mt-5 h-12 w-full gap-2 text-base"
                      onClick={pay}
                      disabled={stage === 'minting'}
                    >
                      {stage === 'minting' ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Minting ticket…
                        </>
                      ) : (
                        <>
                          <Lock className="size-4" />
                          Pay {formatUsd(total)}
                        </>
                      )}
                    </Button>
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="size-3.5 text-success" />
                      Escrow-protected until minted on {order.event.chain}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Confirmation total={total} />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

function Confirmation({ total }) {
  return (
    <div className="mx-auto max-w-lg py-8 text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
        <Check className="size-8" />
      </span>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight">You&apos;re in!</h1>
      <p className="mt-2 text-muted-foreground">
        Your ticket has been minted on-chain and added to your wallet.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm">
        <div className="flex items-center justify-between bg-primary px-5 py-3 text-primary-foreground">
          <span className="font-semibold">{order.event.title}</span>
          <Badge variant="secondary" className="gap-1 bg-primary-foreground/15 text-primary-foreground">
            <Sparkles className="size-3" />
            Minted
          </Badge>
        </div>
        <div className="grid gap-5 p-5 sm:grid-cols-[160px_1fr]">
          <QrCode token="AURORA-VIP-A2-14" />
          <div className="space-y-2.5 text-sm">
            <Row label="Ticket ID" value="#TCK-4822" mono />
            <Row label="Tier" value={order.tier} />
            <Row label="Seat" value={order.seat} />
            <Row label="Date" value={order.event.date} />
            <Row label="Paid" value={formatUsd(total)} />
            <Row label="Tx hash" value="0x7a3f…c21e" mono />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/tickets">
          <Button size="lg" className="w-full gap-2 sm:w-auto">
            View my tickets
          </Button>
        </Link>
        <Button size="lg" variant="outline" className="w-full gap-2 sm:w-auto">
          <Download className="size-4" />
          Add to wallet
        </Button>
      </div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  )
}