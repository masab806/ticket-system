import { useCallback, useEffect, useState } from 'react'
import { Loader2, RefreshCw, ShieldCheck } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import api from '@/api/api'

function formatMoney(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'PKR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

export default function AdminPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState('')
  const [error, setError] = useState('')

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/resale/admin/orders')
      setOrders(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load resale payouts.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const setPayoutPaid = async (order, paid) => {
    setUpdating(order.id)
    setError('')
    try {
      await api.patch(`/resale/admin/orders/${order.id}/payout`, { paid })
      await loadOrders()
      setUpdating('')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update seller payout status.')
      setUpdating('')
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-primary">
                <ShieldCheck className="size-4" /> Platform administration
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Resale seller payouts</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                After paying a seller outside Stripe, mark the sale paid here. This records the payout status; it does not send money.
              </p>
            </div>
            <Button variant="outline" onClick={loadOrders} disabled={loading}>
              <RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
            ) : orders.length === 0 ? (
              <p className="py-20 text-center text-sm text-muted-foreground">No completed resale orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Ticket / event</th>
                      <th className="px-4 py-3">Seller</th>
                      <th className="px-4 py-3">Buyer</th>
                      <th className="px-4 py-3">Sale amount</th>
                      <th className="px-4 py-3">Seller payout</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-4">
                          <p className="font-medium">{order.eventTitle}</p>
                          <p className="mt-1 font-mono text-xs text-muted-foreground">{order.ticketId}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p>{order.seller.name}</p>
                          <p className="text-xs text-muted-foreground">{order.seller.email}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p>{order.buyer.name}</p>
                          <p className="text-xs text-muted-foreground">{order.buyer.email}</p>
                        </td>
                        <td className="px-4 py-4 font-medium">{formatMoney(order.amount, order.currency)}</td>
                        <td className="px-4 py-4">
                          <Badge variant={order.payoutStatus === 'paid' ? 'success' : 'warning'}>
                            {order.payoutStatus === 'paid' ? 'Paid' : 'Unpaid'}
                          </Badge>
                          {order.sellerPaidAt && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(order.sellerPaidAt).toLocaleDateString()}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Button
                            size="sm"
                            variant={order.payoutStatus === 'paid' ? 'outline' : 'default'}
                            type="button"
                            disabled={updating === order.id}
                            onClick={() => setPayoutPaid(order, order.payoutStatus !== 'paid')}
                          >
                            {updating === order.id ? 'Saving…' : order.payoutStatus === 'paid' ? 'Mark unpaid' : 'Mark paid'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
