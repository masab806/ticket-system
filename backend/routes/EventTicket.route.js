const express = require("express")
const router = express.Router()
const {MintBatch, GetTotalTickets} = require("../controllers/EventTicketController")

router.post("/events/:eventId/mint-batch", MintBatch)
router.get("/tickets/total", GetTotalTickets)

module.exports = router