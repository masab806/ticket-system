const attendeeService = require("../services/attendeeService")

const getAttendees = async (req, res) => {
    try {
        const attendees = await attendeeService.getAttendees(
            req.params.eventId
        )

        res.status(200).json(attendees)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const createAttendee = async (req, res) => {
    try {
        const attendeeData = {
            ...req.body,
            event: req.params.eventId
        }

        const attendee = await attendeeService.createAttendee(
            attendeeData
        )

        res.status(201).json(attendee)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const updateAttendee = async (req, res) => {
    try {
        const attendee = await attendeeService.updateAttendee(
            req.params.attendeeId,
            req.body
        )

        if (!attendee) {
            return res.status(404).json({
                message: "Attendee not found"
            })
        }

        res.status(200).json(attendee)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}
module.exports = {
    getAttendees,
    createAttendee,
    updateAttendee
}