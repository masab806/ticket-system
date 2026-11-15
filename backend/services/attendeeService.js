const Attendee = require("../models/Attendee")

const getAttendees = async (eventId) => {
    const attendees = await Attendee.find({
        event: eventId
    }).populate("event", "title")

    return attendees
}

const createAttendee = async (attendeeData) => {
    const attendee = await Attendee.create(attendeeData)

    return attendee
}

const updateAttendee = async (attendeeId, attendeeData) => {
    const attendee = await Attendee.findByIdAndUpdate(
        attendeeId,
        attendeeData,
        { new: true, runValidators: true }
    )

    return attendee
}

module.exports = {
    getAttendees,
    createAttendee,
    updateAttendee
}