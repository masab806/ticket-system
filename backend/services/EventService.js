const { Event } = require('../models/Event')

// Fetch all events with optional search, category, and sorting filters at DB level
const getAllEvents = async ({ query, category, sort }) => {
    const filter = {}

    // Filter by search query across title, city, or venue
    if (query) {
        const regex = new RegExp(query, 'i')
        filter.$or = [{ name: regex }, { title: regex }, { city: regex }, { venue: regex }]
    }

    // Filter by category
    if (category && category !== 'All') {
        filter.category = category
    }

    // Define sort order
    let sortOption = { createdAt: -1 }
    if (sort === 'priceLow') sortOption = { ticketPrice: 1 }
    if (sort === 'priceHigh') sortOption = { ticketPrice: -1 }
    if (sort === 'trending') sortOption = { mintedTickets: -1, createdAt: -1 }

    const events = await Event.find(filter).sort(sortOption)

    // Map fields to present clean payload to client
    // services/eventService.js

    return events.map((doc) => {
        const e = doc.toObject ? doc.toObject() : doc

        // Ensure city is always a string
        let cityString = 'Unspecified'
        if (typeof e.city === 'string') {
            cityString = e.city
        } else if (typeof e.city === 'object' && e.city !== null) {
            cityString = e.city.name || e.city.country || 'Unspecified'
        }

        return {
            ...e,
            id: e._id?.toString() || e.id,
            title: e.title || e.name || 'Untitled Event',
            priceFrom: e.ticketPrice ?? e.priceFrom ?? 0,
            soldPct: e.totalTickets ? Math.round(((e.mintedTickets || 0) / e.totalTickets) * 100) : 0,
            date: e.startsAt ? new Date(e.startsAt).toISOString() : e.date,
            city: cityString,
            venue: typeof e.venue === 'object' ? e.venue?.name || 'TBA' : e.venue || 'TBA',
            category: e.category || 'General',
        }
    })
}

const getEventById = async (id) => {
    const event = await Event.findById(id)

    if (!event) {
        throw new Error('Event not found')
    }

    const e = event.toObject ? event.toObject() : event

    let cityString = 'Unspecified'

    if (typeof e.city === 'string') {
        cityString = e.city
    } else if (typeof e.city === 'object' && e.city !== null) {
        cityString = e.city.name || e.city.country || 'Unspecified'
    }

    return {
        ...e,
        id: e._id?.toString() || e.id,
        title: e.title || e.name || 'Untitled Event',
        priceFrom: e.ticketPrice ?? e.priceFrom ?? 0,
        soldPct: e.totalTickets
            ? Math.round(((e.mintedTickets || 0) / e.totalTickets) * 100)
            : 0,
        date: e.startsAt
            ? new Date(e.startsAt).toISOString()
            : e.date,
        city: cityString,
        venue:
            typeof e.venue === 'object'
                ? e.venue?.name || 'TBA'
                : e.venue || 'TBA',
        category: e.category || 'General',
    }
}

// Fetch all distinct event categories for filter tabs
const getCategories = async () => {
    const categories = await Event.distinct('category')
    return categories.filter(Boolean)
}

module.exports = {
    getAllEvents,
    getCategories,
    getEventById
}