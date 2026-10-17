const mongoose = require("mongoose");

const TicketCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence: { type: Number, default: 0 },
});

const TicketCounter = mongoose.model("TicketCounter", TicketCounterSchema);

module.exports = { TicketCounter };
