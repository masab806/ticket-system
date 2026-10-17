import { useCallback, useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import {
  ArrowRight,
  BadgeCheck,
  Gavel,
  Loader2,
  MapPin,
  ShieldCheck,
  Tag,
  X,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import api from '@/api/api'
import { useAuth } from '@/context/AuthContext'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : Promise.resolve(null)
const tabs = ['Buy resale', 'Sell a ticket']

function formatMoney(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'PKR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

function formatDate(value) {
  if (!value) return 'Date to be announced'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date to be announced'
    : date.toLocaleDateString(undefined, { dateStyle: 'medium' })
}

export default function ResalePage() {
  const [tab, setTab] = useState('Buy resale')
  const [listings, setListings] = useState([])
  const [tickets, setTickets] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selectedListing, setSelectedListing] = useState(null)
  const { token } = useAuth()

  const refreshResaleData = useCallback(async () => {
    const [listingResponse, ticketsResponse, salesResponse] = await Promise.all([
      api.get('/resale/listings'),
      api.get('/resale/mine'),
      api.get('/resale/sales'),
    ])
    setListings(listingResponse.data)
    setTickets(ticketsResponse.data)
    setSales(salesResponse.data)
  }, [])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setError('Sign in to buy or sell resale tickets.')
      return
    }
    let cancelled = false
    setLoading(true)
    Promise.all([
      api.get('/resale/listings'),
      api.get('/resale/mine'),
      api.get('/resale/sales'),
    ]).then(([listingResponse, ticketsResponse, salesResponse]) => {
      if (cancelled) return
      setListings(listingResponse.data)
      setTickets(ticketsResponse.data)
      setSales(salesResponse.data)
    }).catch((err) => {
      if (!cancelled) setError(err.response?.data?.message || 'Could not load the resale market.')
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [token])

  const submitListing = async (ticketId, price) => {
    setError('')
    setNotice('')
    try {
      await api.post('/resale/listings', { ticketId, price })
      await refreshResaleData()
      setNotice('Your ticket is now listed for resale.')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not list this ticket.')
    }
  }

  const cancelListing = async (listingId) => {
    setError('')
    try {
      await api.delete(`/resale/listings/${listingId}`)
      await refreshResaleData()
      setNotice('Your listing has been cancelled.')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel this listing.')
    }
  }

  const startCheckout = async ({ listing, walletAddress }) => {
    const { data } = await api.post(`/resale/listings/${listing.id}/checkout`, { walletAddress })
    return data
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Gavel className="size-4" />
              Secondary market
            </div>
            <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Resale & transfers
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Buy authenticated tickets from fans. Stripe processes buyer payments; sellers are paid manually by the platform.
              Resale prices are capped at 120% of face value. Platform-custodied tickets only can currently be resold.
            </p>
            <div className="mt-6 flex gap-1 rounded-xl border border-border bg-muted/50 p-1">
              {tabs.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={cn(
                    'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none',
                    tab === item
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {notice && (
            <div className="mb-5 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
              {notice}
            </div>
          )}
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
          ) : !token ? (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground">
              Sign in to use the resale market.
            </div>
          ) : tab === 'Buy resale' ? (
            <BuyResale listings={listings} onBuy={setSelectedListing} />
          ) : (
            <SellTickets
              tickets={tickets}
              sales={sales}
              onList={submitListing}
              onCancel={cancelListing}
            />
          )}
        </section>
      </main>
      <SiteFooter />
      {selectedListing && (
        <PurchaseDialog
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onStartCheckout={startCheckout}
          onComplete={async () => {
            await refreshResaleData()
            setSelectedListing(null)
            setNotice('Payment confirmed. The ticket is being transferred to your wallet.')
          }}
        />
      )}
    </div>
  )
}

function BuyResale({ listings, onBuy }) {
  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-20 text-center">
        <p className="font-medium">No resale tickets are available right now.</p>
        <p className="mt-1 text-sm text-muted-foreground">Check back later for new listings.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {listings.map((listing) => (
        <article key={listing.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="relative size-28 shrink-0 overflow-hidden rounded-xl">
            <img src={listing.image || '/placeholder.svg'} alt={listing.eventTitle} className="absolute inset-0 size-full object-cover" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold">{listing.eventTitle}</p>
                <p className="text-xs text-muted-foreground">{formatDate(listing.date)}</p>
              </div>
              <Badge variant="secondary">{listing.category}</Badge>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" /> {listing.venue}, {listing.city}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-success">
              <BadgeCheck className="size-3.5" /> Ticket and listing verified
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Seller receives a manual payout from the platform.</p>
            <div className="mt-auto flex items-end justify-between gap-3 pt-3">
              <div>
                <p className="text-lg font-semibold">{formatMoney(listing.price, listing.currency)}</p>
                <p className="text-[11px] text-muted-foreground">
                  Face {formatMoney(listing.facePrice, listing.currency)} · cap {formatMoney(listing.priceCap, listing.currency)}
                </p>
              </div>
              <Button className="gap-1.5" onClick={() => onBuy(listing)}>
                Buy now <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function SellTickets({ tickets, sales, onList, onCancel }) {
  const [prices, setPrices] = useState({})

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div>
        <h2 className="text-lg font-semibold">Your tickets</h2>
        <p className="text-sm text-muted-foreground">Choose a ticket to list it for resale. Buyers pay through Stripe.</p>
        <div className="mt-4 space-y-3">
          {tickets.map((ticket) => (
            <TicketSaleRow
              key={ticket.id}
              ticket={ticket}
              price={prices[ticket.id] ?? String(ticket.pricePaid || ticket.facePrice || '')}
              onPriceChange={(value) => setPrices((current) => ({ ...current, [ticket.id]: value }))}
              onList={() => onList(ticket.id, prices[ticket.id] ?? ticket.pricePaid ?? ticket.facePrice)}
              onCancel={() => onCancel(ticket.listing.id)}
            />
          ))}
          {tickets.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              You don’t have any tickets to list yet.
            </div>
          )}
        </div>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Tag className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">How seller payments work</h3>
          </div>
          <p className="mt-2 rounded-lg bg-warning/15 p-3 text-sm text-warning-foreground">
            Stripe collects the buyer’s payment into the platform account. Seller payouts are not automatic; the platform must pay sellers manually outside Stripe.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            The existing ticket transfers to the buyer’s wallet after Stripe confirms payment. Only list a ticket if you agree to receive your sale proceeds through the platform’s separate manual payout process.
          </p>
          <div className="my-6 h-px bg-border" />
          <h4 className="font-medium">Your completed sales</h4>
          {sales.length ? (
            <div className="mt-3 space-y-3">
              {sales.map((sale) => (
                <div key={sale.id} className="rounded-lg bg-muted/60 p-3 text-sm">
                  <p className="font-medium">{sale.eventTitle}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">{sale.ticketId}</p>
                  <p className="mt-1">{formatMoney(sale.amount, sale.currency)}</p>
                  <Badge variant="warning" className="mt-2">Manual payout pending</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">Completed resale proceeds will appear here.</p>
          )}
        </div>
      </aside>
    </div>
  )
}

function TicketSaleRow({ ticket, price, onPriceChange, onList, onCancel }) {
  const listing = ticket.listing
  const cap = Math.floor(ticket.facePrice * 1.2 * 100) / 100

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
        <img src={ticket.image || '/placeholder.svg'} alt={ticket.eventTitle} className="absolute inset-0 size-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium">{ticket.eventTitle}</p>
          {listing?.status === 'active' && <Badge variant="warning">Listed</Badge>}
          {listing?.status === 'reserved' && <Badge variant="secondary">Checkout in progress</Badge>}
          {ticket.status === 'used' && <Badge variant="secondary">Used</Badge>}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{formatDate(ticket.date)} · {ticket.venue}, {ticket.city}</p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{ticket.ticketId}</p>
      </div>
      {listing?.status === 'active' ? (
        <Button variant="outline" onClick={onCancel}>Cancel listing</Button>
      ) : listing?.status === 'reserved' ? (
        <span className="text-xs text-muted-foreground">Reserved while buyer checks out</span>
      ) : ticket.status === 'sold' ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0.01"
            max={cap}
            step="0.01"
            value={price}
            onChange={(event) => onPriceChange(event.target.value)}
            aria-label={`Asking price for ${ticket.eventTitle}`}
            className="w-32"
          />
          <Button onClick={onList} disabled={!price}>List</Button>
        </div>
      ) : null}
      <p className="w-full text-right text-[11px] text-muted-foreground sm:w-auto">
        Max {formatMoney(cap, ticket.currency)}
      </p>
    </div>
  )
}

function PurchaseDialog({ listing, onClose, onStartCheckout, onComplete }) {
  const [walletAddress, setWalletAddress] = useState('')
  const [checkout, setCheckout] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const beginPayment = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (!stripePublishableKey.startsWith('pk_')) {
        throw new Error('Stripe is not configured in the frontend. Set VITE_STRIPE_PUBLISHABLE_KEY to your Stripe publishable key and restart Vite.')
      }
      const result = await onStartCheckout({ listing, walletAddress })
      if (!result.clientSecret || !result.orderId) {
        throw new Error('The server did not return a Stripe checkout session. Check the backend logs.')
      }
      setCheckout(result)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start checkout.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-foreground/50 p-4">
      <div className="my-auto w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Resale checkout</p>
            <h2 className="mt-1 text-xl font-semibold">{listing.eventTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{formatMoney(listing.price, listing.currency)}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close checkout" className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>

        {!checkout ? (
          <form className="mt-5 space-y-4" onSubmit={beginPayment}>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Recipient wallet address</span>
              <Input
                value={walletAddress}
                onChange={(event) => setWalletAddress(event.target.value)}
                placeholder="0x..."
                autoComplete="off"
                required
              />
            </label>
            <p className="text-xs text-muted-foreground">The existing on-chain ticket will be transferred to this wallet after your payment succeeds.</p>
            {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : 'Continue to payment'}
            </Button>
          </form>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret: checkout.clientSecret }}>
            <ResalePaymentForm orderId={checkout.orderId} onComplete={onComplete} />
          </Elements>
        )}
      </div>
    </div>
  )
}

function ResalePaymentForm({ orderId, onComplete }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)
  const [transferPending, setTransferPending] = useState(false)

  const pay = async (event) => {
    event.preventDefault()
    if (!stripe || !elements) return
    setPaying(true)
    setError('')
    try {
      const result = await stripe.confirmPayment({ elements, redirect: 'if_required' })
      if (result.error) {
        setError(result.error.message || 'Payment could not be completed.')
        return
      }
      if (result.paymentIntent?.status !== 'succeeded') {
        setError('Stripe has not confirmed the payment yet. Try again after completing any required authentication.')
        return
      }
      setTransferPending(true)
      for (let attempt = 0; attempt < 30; attempt += 1) {
        const { data } = await api.get(`/resale/orders/${orderId}`)
        if (data.status === 'succeeded') {
          await onComplete(orderId)
          return
        }
        if (data.status === 'failed') {
          setError('Payment was received, but the ticket transfer is not complete. Contact support with your payment receipt.')
          setTransferPending(false)
          return
        }
        await new Promise((resolve) => window.setTimeout(resolve, 2000))
      }
      setError('Payment succeeded, but the ticket transfer is still processing. You can safely close this window; do not pay again.')
    } catch (pollError) {
      setError(pollError.response?.data?.message || 'Payment succeeded, but transfer status could not be loaded. Do not pay again.')
    } finally {
      setPaying(false)
      setTransferPending(false)
    }
  }

  return (
    <form className="mt-5 space-y-4" onSubmit={pay}>
      {transferPending ? (
        <div className="flex items-center gap-3 rounded-lg bg-accent p-4 text-sm">
          <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
          <span>Payment received. Waiting for the secure ticket transfer to finish…</span>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-input p-3">
            <PaymentElement onReady={() => setError('')} onLoadError={(event) => setError(event.error.message || 'Stripe payment form failed to load. Check your publishable key.')} />
          </div>
          {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={!stripe || paying}>
            {paying ? <Loader2 className="size-4 animate-spin" /> : 'Pay securely with Stripe'}
          </Button>
        </>
      )}
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-success" /> Secure payment · ticket transfers after confirmation
      </p>
    </form>
  )
}
