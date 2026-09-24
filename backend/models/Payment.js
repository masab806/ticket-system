const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", default: null, index: true },
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }],
    quantity: { type: Number, required: true, min: 1, default: 1 },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    stripePaymentIntentId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, enum: ["PKR", "USD"] },
    status: { type: String, enum: ["pending", "succeeded", "failed"], default: "pending", index: true },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", PaymentSchema);
module.exports = { Payment };