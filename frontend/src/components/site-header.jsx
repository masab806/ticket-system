import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Ticket, Menu, X, Wallet, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const nav = [
  { href: '/events', label: 'Browse' },
  { href: '/resale', label: 'Resale' },
  { href: '/tickets', label: 'My Tickets' },
  { href: '/history', label: 'Activity' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const { role, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
}

  const navigationItems =
    role === 'organizer'
      ? [...nav, { href: '/organizer', label: 'Organizer' }]
      : nav
  
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Ticket className="size-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Tessera</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navigationItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/verify" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ShieldCheck className="size-4 text-success" />
              Verify
            </Button>
          </Link>
          <Button size="sm" className="gap-1.5">
            <Wallet className="size-4" />
            <span className="hidden sm:inline">Connect Wallet</span>
            <span className="sm:hidden">Connect</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout} >Logout </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {[...navigationItems, { href: '/verify', label: 'Verify Ticket' }].map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

export default SiteHeader