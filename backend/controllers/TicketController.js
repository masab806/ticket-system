const ticketService = require("../services/Ticket.service");

const getMyTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getUserTickets(req.user.userId);
    res.status(200).json(tickets);
  } catch (error) {
    console.error("getMyTickets error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch tickets" });
  }
};

module.exports = { getMyTickets };
