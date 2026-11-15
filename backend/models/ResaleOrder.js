const mongoose = require("mongoose");

const ResaleOrderSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResaleListing",
      required: true,
      index: true,
    },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    buyerWalletAddress: { type: String, required: true, trim: true, lowercase: true },
    stripePaymentIntentId: { type: String, unique: true, sparse: true, index: true },
    transferTxHash: { type: String, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, required: true, enum: ["PKR", "USD"] },
    status: {
      type: String,
      enum: ["pending", "processing", "succeeded", "failed"],
      default: "pending",
      index: true,
    },
    sellerPayoutStatus: {
      type: String,
      enum: ["not_due", "manual_pending", "paid"],
      default: "not_due",
      index: true,
    },
    sellerPaidAt: { type: Date },
    sellerPaidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const ResaleOrder = mongoose.model("ResaleOrder", ResaleOrderSchema);
module.exports = { ResaleOrder };
