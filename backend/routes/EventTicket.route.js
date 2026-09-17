const express = require("express")
const router = express.Router()
const {EventTicketController} = require("../controllers/EventTicketController")

router.post("/events/:eventId/mint-batch", EventTicketController.mintBatch)
router.get("/tickets/total", EventTicketController.getTotalTickets)

module.exports = router