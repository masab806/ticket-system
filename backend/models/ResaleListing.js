const mongoose = require("mongoose");

const ResaleListingSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      unique: true,
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    price: { type: Number, required: true, min: 0.01 },
    currency: { type: String, required: true, enum: ["PKR", "USD"] },
    status: {
      type: String,
      enum: ["active", "reserved", "sold", "cancelled"],
      default: "active",
      index: true,
    },
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reservedWalletAddress: { type: String, trim: true, lowercase: true },
    reservedUntil: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

const ResaleListing = mongoose.model("ResaleListing", ResaleListingSchema);
module.exports = { ResaleListing };
