const paymentService = require("../services/Paymentservice");

const createPaymentIntent = async (req, res) => {
  try {
    const { eventId, ticketId, quantity } = req.body;
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authenticated user ID is missing" });
    }

    const result = await paymentService.createPaymentIntentForTicket({
      ticketId: eventId || ticketId,
      userId,
      quantity,
    });

    res.json(result);
  } catch (err) {
    console.error("createPaymentIntent error:", err);
    res.status(err.statusCode || 500).json({ message: err.message || "Could not create payment" });
  }
};

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = paymentService.verifyWebhookSignature(req.body, sig);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      await paymentService.handlePaymentSucceeded(event.data.object);
    } else if (event.type === "payment_intent.payment_failed") {
      await paymentService.handlePaymentFailed(event.data.object);
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).json({ received: false });
  }
};

module.exports = {
  createPaymentIntent,
  stripeWebhook,
};