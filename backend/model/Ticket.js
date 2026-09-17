// models/Ticket.model.js
const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    tokenId: {
      type: String,
      required: true,
      unique: true,
    },
    mintTxHash: {
      required: true,
      trim: true,
    },
    walletAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    pricePaid: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      enum: ["PKR", "USD"],
    },
    stripePaymentIntentId: {
      type: String,
      trim: true,
    },
    soldAt: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["available", "sold", "used"],
      default: "available",
      index: true,
    },
  },
  { timestamps: true }
);

TicketSchema.index({ eventId: 1, status: 1 });

const ticketModel = mongoose.model("Ticket", TicketSchema)

module.exports = {
    ticketModel
}