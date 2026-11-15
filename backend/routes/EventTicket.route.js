const express = require("express")
const router = express.Router()
const {VerifyTicket, GetTotalTickets} = require("../controllers/EventTicketController")

router.post("/tickets/verify", VerifyTicket)
router.get("/tickets/total", GetTotalTickets)

module.exports = router