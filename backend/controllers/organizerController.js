const organizerService = require("../services/organizerService")

const getEvents = async (req, res) => {
    try {
        const events = await organizerService.getEvents(req.params.organizerId)

        res.status(200).json(events)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const createEvent = async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            organizer: req.params.organizerId
        }

        const event = await organizerService.createEvent(eventData)

        res.status(201).json(event)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const updateEvent = async (req, res) => {
    try {
        const event = await organizerService.updateEvent(
            req.params.eventId,
            req.body
        )

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            })
        }

        res.status(200).json(event)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const deleteEvent = async (req, res) => {
    try {
        const event = await organizerService.deleteEvent(
            req.params.eventId
        )

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            })
        }

        res.status(200).json({
            message: "Event deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}
const getDashboard = async (req, res) => {
    try {
        const dashboard = await organizerService.getDashboard(
            req.params.organizerId
        )

        res.status(200).json(dashboard)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

module.exports = {
    getEvents,createEvent,updateEvent,deleteEvent,
    getDashboard
}