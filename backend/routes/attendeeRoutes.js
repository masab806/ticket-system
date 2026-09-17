const express = require("express")
const attendeeController = require("../controllers/attendeeController")

const router = express.Router()

router.get("/:eventId", attendeeController.getAttendees)
router.post("/:eventId", attendeeController.createAttendee)
router.put("/:attendeeId", attendeeController.updateAttendee)

module.exports = router