const Event = require("../models/Event")

const getEvents = async (organizerId) => {
    const events = await Event.find({
        organizer: organizerId
    })

    return events
}
const createEvent = async (eventData) => {
    const event = await Event.create(eventData)

    return event
}

const updateEvent = async (eventId, eventData) => {
    const event = await Event.findByIdAndUpdate(
        eventId,
        eventData,
        { new: true, runValidators: true }
    )

    return event
}
const deleteEvent = async (eventId) => {
    const event = await Event.findByIdAndDelete(eventId)

    return event
}

const getDashboard = async (organizerId) => {
    const events = await Event.find({
        organizer: organizerId
    })

    const grossRevenue = events.reduce(
        (sum, event) => sum + event.gross,
        0
    )

    const ticketsSold = events.reduce(
        (sum, event) => sum + event.sold,
        0
    )

    const averageTicketPrice =
        ticketsSold > 0 ? grossRevenue / ticketsSold : 0

    const revenueChart = events.map(event => ({
    month: new Date(event.createdAt).toLocaleString("en-US", {
        month: "short"
    }),
        revenue: event.gross
    }))
    return {
        grossRevenue,
        ticketsSold,
        averageTicketPrice,
        resaleVolume: 0,
        revenueChart,
        events
    }

}



module.exports = {
    getEvents, createEvent, updateEvent, deleteEvent,
    getDashboard
}