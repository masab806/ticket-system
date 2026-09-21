import { Link } from 'react-router-dom'
import { Ticket, ShieldCheck } from 'lucide-react'

const columns = [
  {
    title: 'Marketplace',
    links: [
      { href: '/events', label: 'Browse Events' },
      { href: '/resale', label: 'Resale Market' },
      { href: '/tickets', label: 'My Tickets' },
      { href: '/history', label: 'Activity' },
    ],
  },
  {
    title: 'Organizers',
    links: [
      { href: '/organizer', label: 'Dashboard' },
      { href: '/organizer', label: 'Create Event' },
      { href: '/organizer', label: 'Analytics' },
      { href: '/organizer', label: 'Payouts' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { href: '/verify', label: 'Verify a Ticket' },
      { href: '/verify', label: 'How it Works' },
      { href: '/verify', label: 'On-chain Registry' },
      { href: '/verify', label: 'Anti-Fraud' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Ticket className="size-5" />
              </span>
              <span className="text-lg font-semibold tracking-tight">ChainTix</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The blockchain ticket marketplace where every ticket is real,
              transferable, and truly yours.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-success/12 px-3 py-1 text-xs font-medium text-success">
              <ShieldCheck className="size-3.5" />
              Secured on-chain
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link, i) => (
                  <li key={`${link.label}-${i}`}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© 2026 Chain Tix. All rights reserved.</p>
          <p className="font-mono text-xs">Contract: 0xT3ss…4A2c · Base</p>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter