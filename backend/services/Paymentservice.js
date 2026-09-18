const Stripe = require("stripe");
const { Ticket } = require("../models/Ticket.model");
const { Event } = require("../models/Event.model");
const { Payment } = require("../models/Payment.model");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntentForTicket = async ({ ticketId, userId, walletAddress }) => {
  const ticket = await Ticket.findOne({ _id: ticketId, status: "available" });
  if (!ticket) {
    const err = new Error("Ticket not available");
    err.statusCode = 400;
    throw err;
  }

  const event = await Event.findById(ticket.eventId);
  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  const amount = Math.round(event.ticketPrice * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: event.currency.toLowerCase(),
    metadata: {
      ticketId: ticket._id.toString(),
      eventId: event._id.toString(),
      userId: userId.toString(),
      walletAddress,
    },
  });

  await Payment.create({
    ticket: ticket._id,
    event: event._id,
    user: userId,
    stripePaymentIntentId: paymentIntent.id,
    amount: event.ticketPrice,
    currency: event.currency,
    status: "pending",
  });

  return { clientSecret: paymentIntent.client_secret };
};

const verifyWebhookSignature = (rawBody, signature) => {
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
};

const handlePaymentSucceeded = async (intent) => {
  const { ticketId, eventId, userId, walletAddress } = intent.metadata;

  const ticket = await Ticket.findOneAndUpdate(
    { _id: ticketId, status: "available" },
    {
      status: "sold",
      user: userId,
      walletAddress,
      pricePaid: intent.amount / 100,
      currency: intent.currency.toUpperCase(),
      stripePaymentIntentId: intent.id,
      soldAt: new Date(),
    },
    { new: true }
  );

  if (ticket) {
    await Event.findByIdAndUpdate(eventId, { $inc: { mintedTickets: 1 } });
  }

  await Payment.findOneAndUpdate({ stripePaymentIntentId: intent.id }, { status: "succeeded" });

  // TODO: trigger minting worker here (Feature 5 — coordinate with blockchain teammate)

  return ticket;
};

const handlePaymentFailed = async (intent) => {
  await Payment.findOneAndUpdate({ stripePaymentIntentId: intent.id }, { status: "failed" });
};

module.exports = {
  createPaymentIntentForTicket,
  verifyWebhookSignature,
  handlePaymentSucceeded,
  handlePaymentFailed,
};