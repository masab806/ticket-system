import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import {
  ShieldCheck,
  ScanLine,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Link2,
  Fingerprint,
  Blocks,
  Download,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import api from '@/api/api'
import { useAuth } from '@/context/AuthContext'

const samples = [
  { label: 'Token ID 1', token: 'TCK#-1' },
  { label: 'Invalid token ID', token: '0' },
]

const verificationEndpoint = 'https://unshapen-dandiacally-alessandro.ngrok-free.dev/api/events/tickets/verify'

const steps = [
  { icon: Fingerprint, label: 'Reading secure token' },
  { icon: Blocks, label: 'Querying smart contract' },
  { icon: Link2, label: 'Confirming ownership on-chain' },
]

export default function VerifyPage() {
  const { role } = useAuth()

  if (role !== 'organizer' && role !== 'admin') {
    return <UnauthorizedAccess />
  }

  return <VerifyContent />
}

function UnauthorizedAccess() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Unauthorized Access</h1>
          <p className="mt-2 text-muted-foreground">
            Only organizers and admins can access ticket verification.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function VerifyContent() {
  const [tokenId, setTokenId] = useState('')
  const [state, setState] = useState('idle')
  const [result, setResult] = useState(null)
  const [searchParams] = useSearchParams()
  const scannedToken = searchParams.get('token')
  const handledScannedToken = useRef(null)

  const verify = useCallback(async (value, { download = false } = {}) => {
    const normalizedTokenId = value.trim()
    setTokenId(value)
    setState('checking')
    setResult(null)
    try {
      const { data } = await api.post(verificationEndpoint, {
        tokenId: normalizedTokenId,
      })
      setResult(data)
      if (download && data.valid) downloadTicketPdf(data)
    } catch (error) {
      setResult({
        status: 'invalid',
        reason: error.response?.data?.message || 'Could not verify this ticket.',
      })
    } finally {
      setState('done')
    }
  }, [])

  useEffect(() => {
    if (!scannedToken || handledScannedToken.current === scannedToken) return
    handledScannedToken.current = scannedToken
    void verify(scannedToken, { download: true })
  }, [scannedToken, verify])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border bg-card">
          <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
          <div className="relative mx-auto max-w-2xl px-4 py-14 text-center sm:px-6">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <ShieldCheck className="size-7" />
            </span>
            <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Verify a ticket
            </h1>
            <p className="mt-2 text-pretty text-muted-foreground">
              Enter the ticket ID shown on the ticket (for example, TCK#-1) to
              confirm its authenticity against the blockchain.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <ScanLine className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  placeholder="Enter ticket ID, e.g. TCK#-1"
                  className="pl-9 font-mono text-sm"
                />
              </div>
              <Button
                size="lg"
                className="h-10 gap-2"
                onClick={() => verify(tokenId)}
                disabled={!tokenId.trim() || state === 'checking'}
              >
                {state === 'checking' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ScanLine className="size-4" />
                )}
                Verify
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Try a sample:</span>
              {samples.map((s) => (
                <button
                  key={s.token}
                  type="button"
                  onClick={() => verify(s.token)}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {state === 'checking' && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-6">
              <ul className="space-y-3">
                {steps.map((step, i) => (
                  <li
                    key={step.label}
                    className="flex items-center gap-3 text-sm"
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <step.icon className="size-4" />
                    </span>
                    <span className="text-muted-foreground">{step.label}</span>
                    <Loader2 className="ml-auto size-4 animate-spin text-primary" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {state === 'done' && result && <ResultCard result={result} />}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function ResultCard({ result }) {
  const config = {
    valid: {
      icon: CheckCircle2,
      title: 'Valid ticket',
      sub: 'Ownership confirmed on-chain. Admit the holder.',
      wrap: 'border-success/40 bg-success/8',
      badge: 'success',
      iconColor: 'text-success',
    },
    used: {
      icon: AlertTriangle,
      title: 'Already used',
      sub: 'This ticket was scanned at entry and cannot be reused.',
      wrap: 'border-warning/50 bg-warning/10',
      badge: 'warning',
      iconColor: 'text-warning-foreground',
    },
    invalid: {
      icon: XCircle,
      title: 'Invalid ticket',
      sub: 'No matching record on-chain. Do not admit.',
      wrap: 'border-destructive/40 bg-destructive/8',
      badge: 'destructive',
      iconColor: 'text-destructive',
    },
  }[result.status]

  const Icon = config.icon

  return (
    <div className={cn('mt-6 rounded-2xl border p-6', config.wrap)}>
      <div className="flex items-center gap-3">
        <Icon className={cn('size-8', config.iconColor)} />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{config.title}</h2>
            <Badge variant={config.badge}>{result.status.toUpperCase()}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{config.sub}</p>
          {result.reason && <p className="mt-1 text-sm text-muted-foreground">{result.reason}</p>}
        </div>
      </div>

      {result.status !== 'invalid' && (
        <>
          <dl className="mt-5 space-y-2 border-t border-border/60 pt-4 text-sm">
            <Row label="Event" value={result.event} />
            <Row label="Current owner" value={result.owner} mono />
            <Row label="Mint tx" value={result.txHash} mono />
            <Row label="Token ID" value={result.tokenId} mono />
          </dl>
          {result.valid && (
            <Button className="mt-5 gap-2" variant="outline" onClick={() => downloadTicketPdf(result)}>
              <Download className="size-4" />
              Download verified ticket PDF
            </Button>
          )}
        </>
      )}
    </div>
  )
}

function downloadTicketPdf(ticket) {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const contentWidth = pageWidth - 28
  let y = 20

  pdf.setFontSize(18)
  pdf.text('Blockchain-Verified Ticket', 14, y)
  y += 12
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  pdf.text('BLOCKCHAIN VERIFICATION: VERIFIED', 14, y)
  pdf.setFont('helvetica', 'normal')
  y += 10

  const fields = [
    ['Ticket ID', ticket.tokenId],
    ['Event', ticket.event],
    ['Event date', formatDate(ticket.eventDate)],
    ['Event ends', ticket.eventEndDate ? formatDate(ticket.eventEndDate) : 'Not provided'],
    ['Venue', ticket.venue],
    ['Venue address', ticket.venueAddress],
    ['City', ticket.city],
    ['Ticket tier', ticket.tier],
    ['Seat', ticket.seat],
    ['Ticket status', ticket.status === 'used' ? 'Used' : 'Valid'],
    ['Price paid', ticket.pricePaid == null ? 'Not provided' : `${ticket.pricePaid} ${ticket.currency}`.trim()],
    ['Purchased at', formatDate(ticket.purchasedAt)],
    ['Blockchain token ID', ticket.chainTokenId],
    ['Current owner', ticket.owner],
    ['Mint transaction', ticket.txHash],
    ['Verified at', new Date().toLocaleString()],
  ]

  for (const [label, rawValue] of fields) {
    const value = rawValue == null || rawValue === '' ? 'Not provided' : String(rawValue)
    const lines = pdf.splitTextToSize(value, contentWidth)
    const fieldHeight = Math.max(10, lines.length * 5 + 5)
    if (y + fieldHeight > pdf.internal.pageSize.getHeight() - 14) {
      pdf.addPage()
      y = 20
    }

    pdf.setFont('helvetica', 'bold')
    pdf.text(`${label}:`, 14, y)
    pdf.setFont('helvetica', 'normal')
    pdf.text(lines, 14, y + 5)
    y += fieldHeight
  }

  pdf.save(`ticket-${String(ticket.tokenId || 'verified').replace(/[^a-zA-Z0-9_-]/g, '-')}.pdf`)
}

function formatDate(value) {
  if (!value) return 'Not provided'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Not provided' : date.toLocaleString()
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  )
}