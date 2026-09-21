import { useEffect, useState, useCallback } from 'react'
import {
  LayoutDashboard,
  CalendarPlus,
  Users,
  Banknote,
  TrendingUp,
  Ticket,
  DollarSign,
  Repeat,
  Plus,
  ArrowUpRight,
  Settings2,
  Download,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RevenueChart } from '@/components/organizer/revenue-chart'
import { organizerEvents, attendees, formatUsd } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import api from '@/api/api'

const sections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'events', label: 'Events', icon: CalendarPlus },
  { id: 'attendees', label: 'Attendees', icon: Users },
  { id: 'payouts', label: 'Payouts', icon: Banknote },
]

const INITIAL_FORM_STATE = {
  name: '',
  slug: '',
  startsAt: '',
  city: '',
  image: '',
  totalTickets: '',
  ticketPrice: '',
  category: '',
  description: '',
  status: 'draft',
}

export default function OrganizerPage() {
  const [section, setSection] = useState('overview')
  const [dashboard, setDashboard] = useState(null)
  const [createEventOpen, setCreateEventOpen] = useState(false)
  const [eventForm, setEventForm] = useState(INITIAL_FORM_STATE)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const { user } = useAuth()

  const sections = [
    { id: 'overview', label: 'Overview', icon: Plus },
    { id: 'events', label: 'Events', icon: Plus },
    { id: 'attendees', label: 'Attendees', icon: Plus },
    { id: 'payouts', label: 'Payouts', icon: Plus },
  ]

  const fetchDashboard = useCallback(async () => {
    if (!user?._id) return
    try {
      const { data } = await api.get(`/organizer/dashboard/${user._id}`)
      setDashboard(data)
    } catch (error) {
      console.error('Error fetching dashboard:', error.response?.data?.message || error.message)
    }
  }, [user?._id])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handleCreateEvent = async () => {
    if (!user?._id) {
      setErrorMsg('User ID is missing')
      return
    }

    if (!eventForm.startsAt) {
      setErrorMsg('Please select a valid start date and time.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const parsedDate = new Date(eventForm.startsAt)
      if (isNaN(parsedDate.getTime())) {
        setErrorMsg('Invalid date selected.')
        setLoading(false)
        return
      }

      const payload = {
        name: eventForm.name,
        slug: eventForm.slug,
        startsAt: parsedDate.toISOString(),
        city: eventForm.city,
        image: eventForm.image,
        totalTickets: Number(eventForm.totalTickets) || 0,
        ticketPrice: Number(eventForm.ticketPrice) || 0,
        category: eventForm.category,
        description: eventForm.description,
        status: eventForm.status,
      }

      const response = await api.post(`/organizer/events/${user._id}`, payload)
      console.log('Event created:', response.data)

      setCreateEventOpen(false)
      setEventForm(INITIAL_FORM_STATE)
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create event'
      setErrorMsg(message)
      console.error('Create event error:', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Organizer dashboard
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Metro Sports Group · Verified organizer
              </p>
            </div>
            <Button
              className="gap-2 self-start sm:self-auto"
              onClick={() => setCreateEventOpen(true)}
            >
              <Plus className="size-4" />
              Create event
            </Button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
            {/* Sidebar */}
            <aside>
              <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 lg:flex-col">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSection(s.id)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                      section === s.id
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <s.icon className="size-4" />
                    {s.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="min-w-0">
              {section === 'overview' && <Overview dashboard={dashboard} />}
              {section === 'events' && <Events dashboard={dashboard} />}
              {section === 'attendees' && <Attendees />}
              {section === 'payouts' && <Payouts />}
            </div>
          </div>
        </div>
      </main>

      {createEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create Event</h2>

              <button
                type="button"
                onClick={() => setCreateEventOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                {errorMsg}
              </div>
            )}

            <div className="mt-5 space-y-4">
              <input
                className="w-full rounded-lg border p-2"
                placeholder="Event name"
                value={eventForm.name}
                onChange={(e) =>
                  setEventForm({ ...eventForm, name: e.target.value })
                }
              />

              <input
                className="w-full rounded-lg border p-2"
                placeholder="Slug"
                value={eventForm.slug}
                onChange={(e) =>
                  setEventForm({ ...eventForm, slug: e.target.value })
                }
              />

              <input
                type="datetime-local"
                className="w-full rounded-lg border p-2"
                value={eventForm.startsAt}
                onChange={(e) =>
                  setEventForm({ ...eventForm, startsAt: e.target.value })
                }
              />

              <input
                className="w-full rounded-lg border p-2"
                placeholder="City"
                value={eventForm.city}
                onChange={(e) =>
                  setEventForm({ ...eventForm, city: e.target.value })
                }
              />

              <input
                className="w-full rounded-lg border p-2"
                placeholder="Category"
                value={eventForm.category}
                onChange={(e) =>
                  setEventForm({ ...eventForm, category: e.target.value })
                }
              />

              <input
                className="w-full rounded-lg border p-2"
                placeholder="Image URL"
                value={eventForm.image}
                onChange={(e) =>
                  setEventForm({ ...eventForm, image: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  className="w-full rounded-lg border p-2"
                  placeholder="Total Tickets"
                  value={eventForm.totalTickets}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, totalTickets: e.target.value })
                  }
                />

                <input
                  type="number"
                  className="w-full rounded-lg border p-2"
                  placeholder="Ticket Price ($)"
                  value={eventForm.ticketPrice}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, ticketPrice: e.target.value })
                  }
                />
              </div>

              <textarea
                className="w-full rounded-lg border p-2"
                placeholder="Event description"
                rows={3}
                value={eventForm.description}
                onChange={(e) =>
                  setEventForm({ ...eventForm, description: e.target.value })
                }
              />

              <select
                className="w-full rounded-lg border p-2"
                value={eventForm.status}
                onChange={(e) =>
                  setEventForm({ ...eventForm, status: e.target.value })
                }
              >
                <option value="draft">Draft</option>
                <option value="on_sale">On sale</option>
              </select>

              <Button
                className="w-full"
                onClick={handleCreateEvent}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </div>
        </div>
      )}
      <SiteFooter />
    </div>
  )
}

function Overview({ dashboard }) {
  const kpis = [
    { label: 'Gross revenue', value: formatUsd(dashboard?.grossRevenue || 0), delta: '+18.2%', icon: DollarSign },
    { label: 'Tickets sold', value: dashboard?.ticketsSold || 0, delta: '+9.4%', icon: Ticket },
    { label: 'Avg. ticket price', value: formatUsd(dashboard?.averageTicketPrice || 0), delta: '+3.1%', icon: TrendingUp },
    { label: 'Resale volume', value: formatUsd(dashboard?.resaleVolume || 0), delta: '+27.0%', icon: Repeat },
  ]
  const events = (dashboard?.events || []).map(event => ({
    id: event._id,
    title: event.title,
    status: event.status,
    image: event.image,
    date: new Date(event.date).toLocaleDateString(),
    city: event.city,
    sold: event.sold,
    capacity: event.capacity,
    gross: event.gross,
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <k.icon className="size-4" />
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-success">
                <ArrowUpRight className="size-3" />
                {k.delta}
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{k.value}</p>
            <p className="text-sm text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Revenue</h2>
            <p className="text-sm text-muted-foreground">Last 6 months</p>
          </div>
          <Badge variant="success" className="gap-1">
            <TrendingUp className="size-3" />
            Trending up
          </Badge>
        </div>
        <div className="mt-6">
          <RevenueChart data={dashboard?.revenueChart || []} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between p-5">
          <h2 className="font-semibold">Your events</h2>
          <span className="text-sm text-muted-foreground">
            {dashboard?.events?.length || 0} total
          </span>
        </div>
        <EventTable events={events.slice(0, 3)} />
      </div>
    </div>
  )
}

function Events({ dashboard, onRefresh }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between p-5">
        <div>
          <h2 className="font-semibold">Manage events</h2>
          <p className="text-sm text-muted-foreground">Track sales and inventory per event.</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          New
        </Button>
      </div>
      <EventTable events={dashboard?.events || []} />
    </div>
  )
}

export function EventRowActions({ event, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(false)

  // Edit Form State pre-populated with selected event
  const [editForm, setEditForm] = useState({
    name: event.title || event.name || '',
    startsAt: event.startsAt ? new Date(event.startsAt).toISOString().slice(0, 16) : '',
    ticketPrice: event.ticketPrice || 0,
    totalTickets: event.capacity || event.totalTickets || 0,
    status: event.status || 'draft',
  })

  // Handle Edit Submit
  const handleUpdate = async () => {
    setLoading(true)
    try {
      await api.put(`/organizer/events/${event.id || event._id}`, {
        ...editForm,
        startsAt: new Date(editForm.startsAt).toISOString(),
        ticketPrice: Number(editForm.ticketPrice),
        totalTickets: Number(editForm.totalTickets),
      })
      setIsEditing(false)
      if (onRefresh) onRefresh()
    } catch (error) {
      console.error('Update event error:', error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Delete
  const handleDelete = async () => {
    setLoading(true)
    try {
      await api.delete(`/organizer/events/${event.id || event._id}`)
      setIsDeleting(false)
      if (onRefresh) onRefresh()
    } catch (error) {
      console.error('Delete event error:', error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* More Options Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="More options">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 size-4" />
            Edit Event
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setIsDeleting(true)}
          >
            <Trash2 className="mr-2 size-4" />
            Delete Event
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Event Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Edit Event</h2>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium">Event Name</label>
                <input
                  className="w-full rounded-lg border p-2 text-sm mt-1"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-medium">Start Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border p-2 text-sm mt-1"
                  value={editForm.startsAt}
                  onChange={(e) => setEditForm({ ...editForm, startsAt: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium">Ticket Price ($)</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border p-2 text-sm mt-1"
                    value={editForm.ticketPrice}
                    onChange={(e) => setEditForm({ ...editForm, ticketPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Capacity / Tickets</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border p-2 text-sm mt-1"
                    value={editForm.totalTickets}
                    onChange={(e) => setEditForm({ ...editForm, totalTickets: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium">Status</label>
                <select
                  className="w-full rounded-lg border p-2 text-sm mt-1"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="on_sale">On sale</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold">Delete Event</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{event.title || event.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDeleting(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function EventTable({ events, onRefresh }) {
  const statusVariant = {
    'On sale': 'success',
    'Sold out': 'secondary',
    Draft: 'warning',
    Past: 'secondary',
  }

  return (
    <div className="divide-y divide-border border-t border-border">
      {events.map((e) => {
        const sold = e.sold ?? e.mintedTickets ?? 0
        const capacity = e.capacity ?? e.totalTickets ?? 0
        const pct = capacity ? Math.round((sold / capacity) * 100) : 0
        const displayTitle = e.title || e.name || 'Untitled Event'
        const displayDate = e.date ? (isNaN(new Date(e.date).getTime()) ? e.date : new Date(e.date).toLocaleDateString()) : (e.startsAt ? new Date(e.startsAt).toLocaleDateString() : 'N/A')
        const displayGross = e.gross ?? (sold * (e.ticketPrice || 0))

        return (
          <div key={e.id || e._id} className="flex items-center gap-4 p-4">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
              <img
                src={e.image || '/placeholder.svg'}
                alt={displayTitle}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{displayTitle}</p>
                <Badge variant={statusVariant[e.status] || 'default'}>
                  {e.status?.replace('_', ' ') || 'draft'}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {displayDate} · {e.city || 'Unspecified'}
              </p>
            </div>
            <div className="hidden w-40 sm:block">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{sold.toLocaleString()}</span>
                <span>{pct}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-brand-2"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
            <div className="hidden w-24 text-right md:block">
              <p className="font-semibold">{formatUsd ? formatUsd(displayGross) : `$${displayGross.toLocaleString()}`}</p>
              <p className="text-xs text-muted-foreground">gross</p>
            </div>

            {/* Replaced standalone Button with EventRowActions */}
            <EventRowActions event={e} onRefresh={onRefresh} />
          </div>
        )
      })}
    </div>
  )
}

function Attendees() {
  const statusVariant = {
    Valid: 'success',
    'Checked in': 'secondary',
    Resold: 'warning',
  }
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between p-5">
        <div>
          <h2 className="font-semibold">Attendees</h2>
          <p className="text-sm text-muted-foreground">{attendees.length} ticket holders</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="size-4" />
          Export
        </Button>
      </div>
      <div className="overflow-x-auto border-t border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Wallet</th>
              <th className="px-5 py-3 font-medium">Event</th>
              <th className="px-5 py-3 font-medium">Tier</th>
              <th className="hidden px-5 py-3 font-medium sm:table-cell">Purchased</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3.5 font-mono text-xs">{a.wallet}</td>
                <td className="px-5 py-3.5">{a.event}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{a.tier}</td>
                <td className="hidden px-5 py-3.5 text-muted-foreground sm:table-cell">{a.purchased}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Payouts() {
  const payouts = [
    { id: 'p1', date: 'May 1, 2026', event: 'City Finals — Game 7', amount: 412300, status: 'Paid' },
    { id: 'p2', date: 'Apr 15, 2026', event: 'Aurora Nights', amount: 128900, status: 'Paid' },
    { id: 'p3', date: 'Apr 2, 2026', event: 'Pulse — Warehouse Rave', amount: 61200, status: 'Paid' },
  ]
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
          <p className="text-sm text-primary-foreground/80">Available to withdraw</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{formatUsd(184620)}</p>
          <Button className="mt-4 gap-2 bg-background text-foreground hover:bg-background/90">
            <Banknote className="size-4" />
            Withdraw to wallet
          </Button>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Settings2 className="size-4 text-primary" />
            <h2 className="font-semibold">Resale commission</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            You earn a royalty on every resale, enforced by the smart contract.
          </p>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border p-4">
            <span className="text-sm font-medium">Royalty rate</span>
            <span className="text-2xl font-semibold">8%</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Price cap: 120% of face value</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <h2 className="p-5 font-semibold">Payout history</h2>
        <div className="divide-y divide-border border-t border-border">
          {payouts.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4">
              <span className="flex size-10 items-center justify-center rounded-full bg-success/15 text-success">
                <Banknote className="size-5" />
              </span>
              <div className="flex-1">
                <p className="font-medium">{p.event}</p>
                <p className="text-xs text-muted-foreground">{p.date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatUsd(p.amount)}</p>
                <Badge variant="success">{p.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}