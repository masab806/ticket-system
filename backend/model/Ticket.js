const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    txHash: {
      type: String,
      required: true,
      trim: true,
      unique: true, 
    },
    tokenId: {
      type: String,
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
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ["PKR", "USD"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", TicketSchema);