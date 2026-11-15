const eventService = require("../services/EventService")

const getAllEvents = async (req, res) => {
  try {
    const { query, category, sort } = req.query
    const events = await eventService.getAllEvents({ query, category, sort })
    res.json(events)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch events' })
  }
}

const getCategories = async (req, res) => {
  try {
    const categories = await eventService.getCategories()
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch categories' })
  }
}

const getEventById = async (req, res) => {
    try {
        const { id } = req.params

        const event = await eventService.getEventById(id)

        res.json(event)
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid event ID',
            })
        }

        if (error.message === 'Event not found') {
            return res.status(404).json({
                message: 'Event not found',
            })
        }

        res.status(500).json({
            message: error.message || 'Failed to fetch event',
        })
    }
}

module.exports = {
  getAllEvents,
  getCategories,
  getEventById
}