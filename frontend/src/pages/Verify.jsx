import { useState } from 'react'
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
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import api from '@/api/api'

const samples = [
  { label: 'Token ID 1', token: '1' },
  { label: 'Counterfeit', token: 'FAKE-0000-0000-0000' },
]

const steps = [
  { icon: Fingerprint, label: 'Reading secure token' },
  { icon: Blocks, label: 'Querying smart contract' },
  { icon: Link2, label: 'Confirming ownership on-chain' },
]

export default function VerifyPage() {
  const [token, setToken] = useState('')
  const [state, setState] = useState('idle')
  const [result, setResult] = useState(null)

  const verify = async (value) => {
    setToken(value)
    setState('checking')
    setResult(null)
    try {
      const { data } = await api.post('/events/tickets/verify', { token: value.trim() })
      setResult(data)
    } catch (error) {
      setResult({
        status: 'invalid',
        reason: error.response?.data?.message || 'Could not verify this ticket.',
      })
    } finally {
      setState('done')
    }
  }

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
              Scan or paste a ticket token to confirm its authenticity directly
              against the blockchain.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <ScanLine className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste ticket token, e.g. AURORA-4821-…"
                  className="pl-9 font-mono text-sm"
                />
              </div>
              <Button
                size="lg"
                className="h-10 gap-2"
                onClick={() => verify(token)}
                disabled={!token || state === 'checking'}
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
        <dl className="mt-5 space-y-2 border-t border-border/60 pt-4 text-sm">
          <Row label="Event" value={result.event} />
          <Row label="Tier" value={result.tier} />
          <Row label="Seat" value={result.seat} />
          <Row label="Current owner" value={result.owner} mono />
          <Row label="Mint tx" value={result.txHash} mono />
          <Row label="Token ID" value={result.tokenId} mono />
        </dl>
      )}
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