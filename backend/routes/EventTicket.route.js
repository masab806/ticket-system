const express = require("express")
const router = express.Router()
const {EventTicketController} = require("../controllers/EventTicketController")

router.post("/create", EventTicketController.createEvent)
router.post("/events/:eventId/mint", EventTicketController.mintTickets)

module.exports = router