const { Payment } = require("../models/Payment");

const getUserPaymentHistory = async (userId) => {
  const payments = await Payment.find({ user: userId })
    .populate("event", "name title")
    .sort({ createdAt: -1 })
    .lean();

  return payments.map((payment) => ({
    id: payment._id.toString(),
    type: "Purchase",
    event: payment.event?.title || payment.event?.name || "Event ticket",
    date: payment.createdAt,
    amount: payment.amount,
    currency: payment.currency,
    direction: "out",
    status: payment.status === "succeeded" ? "Confirmed" : payment.status,
    txHash: payment.stripePaymentIntentId,
    quantity: payment.quantity,
  }));
};

module.exports = { getUserPaymentHistory };
