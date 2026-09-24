const Stripe = require("stripe");
const { Ticket } = require("../models/Ticket");
const { Event } = require("../models/Event");
const { Payment } = require("../models/Payment");
const { mintTicket } = require("./EventTicket.service");

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
  throw new Error("STRIPE_SECRET_KEY is missing or invalid");
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const stripeCurrency = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();

const createPaymentIntentForTicket = async ({ ticketId, userId, quantity = 1 }) => {
  const event = await Event.findById(ticketId);
  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }
  const requestedQuantity = Number(quantity);
  if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
    const err = new Error("Quantity must be a positive integer");
    err.statusCode = 400;
    throw err;
  }

  if (event.mintedTickets + requestedQuantity > event.totalTickets) {
    const err = new Error("Event is sold out");
    err.statusCode = 400;
    throw err;
  }

  const amount = Math.round(event.ticketPrice * requestedQuantity * 100);

  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: stripeCurrency,
      metadata: {
        ticketId: event._id.toString(),
        eventId: event._id.toString(),
        userId: userId.toString(),
        quantity: requestedQuantity.toString(),
      },
    });
  } catch (error) {
    const err = new Error(`Stripe could not create the payment: ${error.message}`);
    err.statusCode = 502;
    throw err;
  }

  await Payment.create({
    event: event._id,
    user: userId,
    stripePaymentIntentId: paymentIntent.id,
    amount: event.ticketPrice * requestedQuantity,
    quantity: requestedQuantity,
    currency: event.currency,
    status: "pending",
  });

  return { clientSecret: paymentIntent.client_secret };
};

const verifyWebhookSignature = (rawBody, signature) => {
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
};

const handlePaymentSucceeded = async (intent) => {
  const { eventId, userId } = intent.metadata;
  const quantity = Number(intent.metadata.quantity || 1);

  const payment = await Payment.findOne({ stripePaymentIntentId: intent.id });
  if (!payment) {
    throw new Error("Payment record not found");
  }

  if (payment.status === "succeeded" && payment.tickets?.length >= quantity) {
    return Ticket.find({ _id: { $in: payment.tickets } });
  }

  const ticketIds = payment.tickets || [];
  while (ticketIds.length < quantity) {
    const reservedEvent = await Event.findOneAndUpdate(
      { _id: eventId, $expr: { $lt: ["$mintedTickets", "$totalTickets"] } },
      { $inc: { mintedTickets: 1 } },
      { new: true }
    );
    if (!reservedEvent) {
      throw new Error("No tickets remain for this event");
    }

    try {
      const minted = await mintTicket();
      const ticket = await Ticket.create({
        eventId,
        user: userId,
        tokenId: minted.tokenId,
        mintTxHash: minted.mintTxHash,
        walletAddress: minted.walletAddress,
        pricePaid: Number(intent.amount) / 100 / quantity,
        currency: intent.currency.toUpperCase(),
        stripePaymentIntentId: intent.id,
        soldAt: new Date(),
        status: "sold",
      });
      ticketIds.push(ticket._id);

      await Payment.findByIdAndUpdate(payment._id, {
        $set: { tickets: ticketIds, ticket: ticketIds[0] },
      });
    } catch (error) {
      await Event.findByIdAndUpdate(eventId, { $inc: { mintedTickets: -1 } });
      throw error;
    }
  }

  await Payment.findByIdAndUpdate(payment._id, { status: "succeeded" });
  return Ticket.find({ _id: { $in: ticketIds } });
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