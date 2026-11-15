import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  ArrowLeft,
  Check,
  CreditCard,
  Download,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatUsd } from '@/lib/mock-data'
import api from '@/api/api'
import { useAuth } from '@/context/AuthContext'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

export default function CheckoutPage() {
  const { state } = useLocation()
  const summary = state?.summary

  if (!summary?.eventId) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <h1 className="text-2xl font-semibold">Checkout details are missing</h1>
          <p className="mt-2 text-muted-foreground">Choose tickets from an event before opening checkout.</p>
          <Link to="/events" className="mt-6 inline-block">
            <Button>Browse events</Button>
          </Link>
        </div>
      </PageShell>
    )
  }

  return <PageShell><CheckoutSetup summary={summary} /></PageShell>
}

function CheckoutSetup({ summary }) {
  const { token } = useAuth()
  const [clientSecret, setClientSecret] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    if (!token) {
      setError('Please sign in before purchasing a ticket.')
      return
    }

    let cancelled = false
    api.post(
      '/payments/create-intent',
      { eventId: summary.eventId, quantity: summary.qty },
      { headers: { Authorization: `Bearer ${token}` } },
    ).then(({ data }) => {
      if (!cancelled) setClientSecret(data.clientSecret)
    }).catch((err) => {
      if (!cancelled) {
        setError(err.response?.data?.message || err.message || 'Could not initialize Stripe checkout.')
      }
    })

    return () => { cancelled = true }
  }, [summary, token])

  if (error) {
    return (
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
            {error}
          </div>
        </div>
      </main>
    )
  }

  if (!clientSecret) {
    return (
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Preparing secure Stripe checkout…</p>
        </div>
      </main>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: 'stripe', variables: { colorPrimary: '#2563eb', borderRadius: '8px' } },
      }}
    >
      <CheckoutForm summary={summary} />
    </Elements>
  )
}

function CheckoutForm({ summary }) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [email, setEmail] = useState('')
  const [stage, setStage] = useState('form')
  const [error, setError] = useState('')
  const [payment, setPayment] = useState(null)

  const total = summary.total || 0
  const price = summary.subtotal || 0
  const fees = summary.fees || 0

  const pay = async (event) => {
    event.preventDefault()
    if (!stripe || !elements) return
    if (!token) {
      setError('Please sign in before purchasing a ticket.')
      return
    }
    setStage('paying')
    setError('')

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          payment_method_data: {
            billing_details: { email: email.trim() || undefined },
          },
        },
        redirect: 'if_required',
      })

      if (result.error) {
        setError(result.error.message || 'Payment failed.')
        setStage('form')
        return
      }

      if (result.paymentIntent?.status !== 'succeeded') {
        setError('Payment requires additional action before it can complete.')
        setStage('form')
        return
      }

      setPayment(result.paymentIntent)
      setStage('done')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not process payment.')
      setStage('form')
    }
  }

  if (stage === 'done') {
    return <Confirmation summary={summary} total={total} payment={payment} />
  }

  return (
    <main className="flex-1 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to event
        </button>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Secure checkout</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Complete your order</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">1</span>
            <span>Payment</span>
            <span className="h-px w-8 bg-border" />
            <span className="flex size-6 items-center justify-center rounded-full border border-border">2</span>
            <span>Confirmation</span>
          </div>
        </div>

        <form onSubmit={pay} className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-primary" />
                <h2 className="text-lg font-semibold">Payment details</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Pay securely with Stripe. Your tickets are minted only after payment is confirmed.
              </p>

              <div className="mt-5 space-y-4">
                <Field label="Email">
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </Field>
                <Field label="Stripe payment method">
                  <div className="rounded-lg border border-input bg-background p-3">
                    <PaymentElement />
                  </div>
                </Field>
              </div>
            </section>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Stripe secured', 'Your card details never touch our servers.'],
                ['Instant delivery', 'Tickets are assigned after payment.'],
                ['Verified tickets', 'Each ticket is minted on-chain.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-xl border border-border bg-card p-3">
                  <ShieldCheck className="size-4 text-success" />
                  <p className="mt-2 text-xs font-semibold">{title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex gap-3">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                  <Sparkles className="size-6" />
                </div>
                <div>
                  <p className="font-semibold leading-tight">{summary.eventTitle}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{summary.tierName}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-muted/60 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{summary.qty}</span>
                </div>
                {summary.seats?.length > 0 && (
                  <div className="mt-1 flex justify-between gap-4">
                    <span className="text-muted-foreground">Seats</span>
                    <span className="text-right font-medium">{summary.seats.join(', ')}</span>
                  </div>
                )}
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Tickets</dt>
                  <dd>{formatUsd(price)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Service fee</dt>
                  <dd>{formatUsd(fees)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                  <dt>Total</dt>
                  <dd>{formatUsd(total)}</dd>
                </div>
              </dl>

              <Button type="submit" size="lg" className="mt-5 h-12 w-full gap-2 text-base" disabled={stage === 'paying' || !stripe}>
                {stage === 'paying' ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Processing payment…
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
                Secured by Stripe · no wallet required
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  )
}

function PageShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      {children}
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

function Confirmation({ summary, total, payment }) {
  return (
    <main className="flex-1 bg-muted/30">
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
          <Check className="size-8" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">Payment successful</h1>
        <p className="mt-2 text-muted-foreground">
          Stripe confirmed your payment. Your ticket mint is being finalized on-chain.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm">
          <div className="flex items-center justify-between bg-primary px-5 py-3 text-primary-foreground">
            <span className="font-semibold">{summary.eventTitle}</span>
            <Badge variant="secondary" className="gap-1 bg-primary-foreground/15 text-primary-foreground">
              <Sparkles className="size-3" />
              Paid
            </Badge>
          </div>
          <div className="space-y-2.5 p-5 text-sm">
            <Row label="Tier" value={summary.tierName} />
            <Row label="Quantity" value={summary.qty} />
            <Row label="Paid" value={formatUsd(total)} />
            <Row label="Payment intent" value={payment?.id} mono />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/tickets">
            <Button size="lg" className="w-full sm:w-auto">View my tickets</Button>
          </Link>
          <Button size="lg" variant="outline" className="w-full gap-2 sm:w-auto" onClick={() => window.print()}>
            <Download className="size-4" />
            Save receipt
          </Button>
        </div>
      </div>
    </main>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('max-w-[65%] truncate font-medium', mono && 'font-mono text-xs')}>{value || '—'}</span>
    </div>
  )
}
