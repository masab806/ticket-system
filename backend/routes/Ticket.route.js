const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { getMyTickets } = require("../controllers/TicketController");

const router = express.Router();

router.get("/mine", verifyToken, getMyTickets);

module.exports = router;
