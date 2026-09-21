const { mintBatch, getTotalTickets } = require("../services/EventTicket.service");

async function MintBatch(req, res) {
    try {
        const { eventId } = req.params;
        const { quantity } = req.body;

        const result = await mintBatch(eventId, quantity);
        return res.status(201).json({ success: true, ...result });
    } catch (error) {
        console.error(error);
        return res.status(error.status || 500).json({ success: false, message: error.reason || error.message || "Server Error" });
    }
}

async function GetTotalTickets(req, res) {
    try {
        const totalTickets = await getTotalTickets();
        return res.status(200).json({ success: true, totalTickets });
    } catch (error) {
        console.error(error);
        return res.status(error.status || 500).json({ success: false, message: error.reason || error.message || "Server Error" });
    }
}

module.exports = { MintBatch, GetTotalTickets };