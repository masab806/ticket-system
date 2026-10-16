const { verifyTicketToken, getTotalTickets } = require("../services/EventTicket.service");

async function GetTotalTickets(req, res) {
    try {
        const totalTickets = await getTotalTickets();
        return res.status(200).json({ success: true, totalTickets });
    } catch (error) {
        console.error(error);
        return res.status(error.status || 500).json({ success: false, message: error.reason || error.message || "Server Error" });
    }
}

async function VerifyTicket(req, res) {
    try {
        const result = await verifyTicketToken(req.body.token);
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error(error);
        return res.status(error.status || 500).json({ success: false, message: error.reason || error.message || "Server Error" });
    }
}

module.exports = { VerifyTicket, GetTotalTickets };