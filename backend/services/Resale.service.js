const { ethers } = require("ethers");
const { stripe } = require("./Paymentservice");
const { Event } = require("../models/Event");
const { ResaleListing } = require("../models/ResaleListing");
const { ResaleOrder } = require("../models/ResaleOrder");
const { Ticket } = require("../models/Ticket");
const { transferTicketToBuyer, getTicketCustodyStatus } = require("./EventTicket.service");

const RESALE_PRICE_CAP_PERCENT = 120;
const RESERVATION_MINUTES = 30;
const resaleProcessing = new Map();

const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const formatListing = (listing) => {
  const ticket = listing.ticket || {};
  const event = listing.event || {};
  const seller = listing.seller || {};
  const venue = event.venue && typeof event.venue === "object" ? event.venue : {};

  return {
    id: listing._id.toString(),
    ticketId: ticket.tokenId,
    eventId: event._id?.toString(),
    eventTitle: event.name || "Event ticket",
    category: event.category || "Event",
    image: event.bannerUrl || "/placeholder.svg",
    date: event.startsAt,
    city: venue.city || event.city || "Unspecified",
    venue: venue.name || "Venue TBA",
    price: listing.price,
    facePrice: event.ticketPrice,
    priceCap: Math.floor(event.ticketPrice * RESALE_PRICE_CAP_PERCENT) / 100,
    currency: listing.currency,
    sellerName: seller.name || "Verified seller",
    status: listing.status,
  };
};

const releaseExpiredListings = async () => {
  const expired = await ResaleListing.find({
    status: "reserved",
    reservedUntil: { $lte: new Date() },
  });

  for (const listing of expired) {
    const order = await ResaleOrder.findOne({
      listing: listing._id,
      buyer: listing.reservedBy,
      status: { $in: ["pending", "processing"] },
    }).sort({ createdAt: -1 });
    if (!order?.stripePaymentIntentId) {
      await ResaleListing.updateOne(
        { _id: listing._id, status: "reserved", reservedUntil: { $lte: new Date() } },
        { $set: { status: "active", reservedBy: null, reservedWalletAddress: null, reservedUntil: null } }
      );
      continue;
    }

    const intent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
    if (intent.status === "succeeded" || intent.status === "processing") continue;
    if (intent.status !== "canceled") continue;
    await ResaleOrder.updateOne({ _id: order._id, status: "pending" }, { $set: { status: "failed" } });
    await ResaleListing.updateOne(
      { _id: listing._id, status: "reserved", reservedBy: order.buyer },
      { $set: { status: "active", reservedBy: null, reservedWalletAddress: null, reservedUntil: null } }
    );
  }
};

const getActiveListings = async (buyerId) => {
  await releaseExpiredListings();
  const listings = await ResaleListing.find({
    status: "active",
    seller: { $ne: buyerId },
  })
    .populate("ticket", "tokenId chainTokenId")
    .populate("event", "name category bannerUrl startsAt city venue ticketPrice")
    .populate("seller", "name")
    .sort({ createdAt: -1 })
    .lean();
  return listings.map(formatListing);
};

const getMyTicketsForResale = async (userId) => {
  const tickets = await Ticket.find({ user: userId })
    .populate("eventId", "name category bannerUrl startsAt city venue ticketPrice currency")
    .sort({ createdAt: -1 })
    .lean();
  const listings = await ResaleListing.find({
    ticket: { $in: tickets.map((ticket) => ticket._id) },
    status: { $in: ["active", "reserved", "sold"] },
  }).lean();
  const listingByTicket = new Map(listings.map((listing) => [listing.ticket.toString(), listing]));

  return tickets.map((ticket) => {
    const event = ticket.eventId || {};
    const venue = event.venue && typeof event.venue === "object" ? event.venue : {};
    const listing = listingByTicket.get(ticket._id.toString());
    return {
      id: ticket._id.toString(),
      ticketId: ticket.tokenId,
      eventTitle: event.name || "Event ticket",
      image: event.bannerUrl || "/placeholder.svg",
      date: event.startsAt,
      city: venue.city || event.city || "Unspecified",
      venue: venue.name || "Venue TBA",
      pricePaid: ticket.pricePaid,
      facePrice: event.ticketPrice || ticket.pricePaid || 0,
      currency: event.currency || ticket.currency || "PKR",
      status: ticket.status,
      listing: listing ? {
        id: listing._id.toString(),
        status: listing.status,
        price: listing.price,
        currency: listing.currency,
      } : null,
    };
  });
};

const getMySales = async (userId) => {
  const orders = await ResaleOrder.find({ seller: userId, status: "succeeded" })
    .populate("ticket", "tokenId")
    .populate("event", "name")
    .sort({ updatedAt: -1 })
    .lean();

  return orders.map((order) => ({
    id: order._id.toString(),
    ticketId: order.ticket?.tokenId || "Ticket",
    eventTitle: order.event?.name || "Event ticket",
    amount: order.amount,
    currency: order.currency,
    payoutStatus: order.sellerPayoutStatus,
    soldAt: order.updatedAt,
  }));
};

const getAdminResaleOrders = async () => {
  const orders = await ResaleOrder.find({ status: "succeeded" })
    .populate("seller", "name email")
    .populate("buyer", "name email")
    .populate("ticket", "tokenId")
    .populate("event", "name")
    .sort({ sellerPayoutStatus: 1, updatedAt: -1 })
    .lean();

  return orders.map((order) => ({
    id: order._id.toString(),
    eventTitle: order.event?.name || "Event ticket",
    ticketId: order.ticket?.tokenId || "Ticket",
    seller: {
      name: order.seller?.name || "Unknown",
      email: order.seller?.email || "",
    },
    buyer: {
      name: order.buyer?.name || "Unknown",
      email: order.buyer?.email || "",
    },
    amount: order.amount,
    currency: order.currency,
    payoutStatus: order.sellerPayoutStatus,
    sellerPaidAt: order.sellerPaidAt,
    transferTxHash: order.transferTxHash,
    createdAt: order.createdAt,
  }));
};

const updateSellerPayoutStatus = async ({ orderId, adminId, paid }) => {
  if (typeof paid !== "boolean") throw fail("Paid status must be true or false");
  const update = paid
    ? { sellerPayoutStatus: "paid", sellerPaidAt: new Date(), sellerPaidBy: adminId }
    : { sellerPayoutStatus: "manual_pending", sellerPaidAt: null, sellerPaidBy: null };
  const order = await ResaleOrder.findOneAndUpdate(
    { _id: orderId, status: "succeeded" },
    { $set: update },
    { new: true }
  );
  if (!order) throw fail("Completed resale order not found", 404);
  return { id: order._id.toString(), payoutStatus: order.sellerPayoutStatus };
};

const createListing = async ({ userId, ticketId, price }) => {
  const requestedPrice = Number(price);
  if (!Number.isFinite(requestedPrice) || requestedPrice <= 0) {
    throw fail("Enter a valid asking price");
  }

  const ticket = await Ticket.findOne({ _id: ticketId, user: userId });
  if (!ticket || ticket.status !== "sold") {
    throw fail("Only tickets you own and have not used can be listed");
  }
  const event = await Event.findById(ticket.eventId);
  if (!event) throw fail("Ticket event was not found", 404);
  if (event.startsAt <= new Date()) throw fail("Tickets for events that have started cannot be listed");
  const chainTokenId = ticket.chainTokenId || ticket.tokenId.replace(/^TCK#-/, "");
  const custody = await getTicketCustodyStatus(chainTokenId);
  if (!custody.heldByPlatform) {
    throw fail("This ticket is in a personal wallet. Wallet-connected seller transfers are not supported yet.", 409);
  }

  const maxPrice = Math.floor(event.ticketPrice * RESALE_PRICE_CAP_PERCENT) / 100;
  if (requestedPrice > maxPrice) {
    throw fail(`Asking price cannot exceed ${maxPrice.toFixed(2)} ${event.currency}`);
  }

  let listing = await ResaleListing.findOne({ ticket: ticket._id });
  if (listing && ["active", "reserved"].includes(listing.status)) {
    throw fail("This ticket already has a resale listing");
  }
  if (listing) {
    listing.seller = userId;
    listing.event = event._id;
    listing.price = requestedPrice;
    listing.currency = event.currency;
    listing.status = "active";
    listing.reservedBy = null;
    listing.reservedWalletAddress = null;
    listing.reservedUntil = null;
    await listing.save();
  } else {
    listing = await ResaleListing.create({
      ticket: ticket._id,
      seller: userId,
      event: event._id,
      price: requestedPrice,
      currency: event.currency,
    });
  }
  return { id: listing._id.toString(), status: listing.status };
};

const cancelListing = async ({ listingId, userId }) => {
  const listing = await ResaleListing.findOneAndUpdate(
    { _id: listingId, seller: userId, status: "active" },
    { $set: { status: "cancelled" } },
    { new: true }
  );
  if (!listing) throw fail("Active listing not found", 404);
  return { status: listing.status };
};

const createResaleCheckout = async ({ listingId, buyerId, walletAddress }) => {
  if (!ethers.isAddress(walletAddress)) throw fail("Enter a valid recipient wallet address");
  await releaseExpiredListings();

  const listing = await ResaleListing.findOneAndUpdate(
    { _id: listingId, status: "active", seller: { $ne: buyerId } },
    {
      $set: {
        status: "reserved",
        reservedBy: buyerId,
        reservedWalletAddress: walletAddress.toLowerCase(),
        reservedUntil: new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000),
      },
    },
    { new: true }
  );
  if (!listing) throw fail("This ticket is unavailable or you cannot buy your own listing", 409);

  const [ticket, event] = await Promise.all([
    Ticket.findById(listing.ticket),
    Event.findById(listing.event),
  ]);

  try {
    if (!ticket || !event) throw fail("The resale listing is no longer valid", 409);
    const chainTokenId = ticket.chainTokenId || ticket.tokenId.replace(/^TCK#-/, "");
    const custody = await getTicketCustodyStatus(chainTokenId);
    if (!custody.heldByPlatform) {
      throw fail("This ticket is no longer held by the platform and cannot be transferred through this checkout.", 409);
    }

    const order = await ResaleOrder.create({
      listing: listing._id,
      ticket: ticket._id,
      event: event._id,
      buyer: buyerId,
      seller: listing.seller,
      buyerWalletAddress: walletAddress.toLowerCase(),
      amount: listing.price,
      currency: listing.currency,
    });
    const intent = await stripe.paymentIntents.create(
      {
        amount: Math.round(listing.price * 100),
        currency: listing.currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
          flow: "resale",
          resaleOrderId: order._id.toString(),
        },
      },
      { idempotencyKey: `resale-payment-${order._id}` }
    );
    order.stripePaymentIntentId = intent.id;
    await order.save();
    return { orderId: order._id.toString(), clientSecret: intent.client_secret };
  } catch (error) {
    await ResaleListing.updateOne(
      { _id: listing._id, status: "reserved", reservedBy: buyerId },
      { $set: { status: "active", reservedBy: null, reservedWalletAddress: null, reservedUntil: null } }
    );
    throw error;
  }
};

const processResalePaymentSucceeded = async (intent) => {
  const order = await ResaleOrder.findOne({
    _id: intent.metadata.resaleOrderId,
    stripePaymentIntentId: intent.id,
  });
  if (!order) throw new Error("Resale order was not found for the successful payment");
  if (order.status === "succeeded") return order;

  const [listing, ticket] = await Promise.all([
    ResaleListing.findById(order.listing),
    Ticket.findById(order.ticket),
  ]);
  if (!listing || !ticket) {
    throw new Error("Resale order is missing its listing or ticket");
  }
  if (listing.status !== "reserved" || String(listing.reservedBy) !== String(order.buyer)) {
    throw new Error("Resale listing is no longer reserved for this buyer");
  }

  order.status = "processing";
  await order.save();
  const chainTokenId = ticket.chainTokenId || ticket.tokenId.replace(/^TCK#-/, "");
  const transfer = await transferTicketToBuyer({
    tokenId: chainTokenId,
    recipient: order.buyerWalletAddress,
  });
  order.transferTxHash = transfer.txHash || order.transferTxHash;
  await order.save();

  const ownershipUpdate = await Ticket.updateOne(
    { _id: ticket._id, user: { $in: [order.seller, order.buyer] } },
    { $set: { user: order.buyer, walletAddress: order.buyerWalletAddress } }
  );
  if (ownershipUpdate.modifiedCount === 0 && String(ticket.user) !== String(order.buyer)) {
    throw new Error("Ticket ownership changed before resale completion");
  }
  listing.status = "sold";
  listing.reservedUntil = null;
  await listing.save();
  order.status = "succeeded";
  order.sellerPayoutStatus = "manual_pending";
  await order.save();
  return order;
};

const handleResalePaymentSucceeded = (intent) => {
  const existing = resaleProcessing.get(intent.id);
  if (existing) return existing;
  const operation = processResalePaymentSucceeded(intent).finally(() => {
    resaleProcessing.delete(intent.id);
  });
  resaleProcessing.set(intent.id, operation);
  return operation;
};

const handleResalePaymentFailed = async (intent) => {
  const order = await ResaleOrder.findOneAndUpdate(
    { _id: intent.metadata.resaleOrderId, stripePaymentIntentId: intent.id, status: { $ne: "succeeded" } },
    { $set: { status: "failed" } },
    { new: true }
  );
  if (order) {
    await ResaleListing.updateOne(
      { _id: order.listing, status: "reserved", reservedBy: order.buyer },
      { $set: { status: "active", reservedBy: null, reservedWalletAddress: null, reservedUntil: null } }
    );
  }
};

const getResaleOrderStatus = async ({ orderId, userId }) => {
  const order = await ResaleOrder.findOne({
    _id: orderId,
    $or: [{ buyer: userId }, { seller: userId }],
  }).select("status sellerPayoutStatus transferTxHash amount currency");
  if (!order) throw fail("Resale order not found", 404);
  return {
    status: order.status,
    sellerPayoutStatus: order.sellerPayoutStatus,
    transferTxHash: order.transferTxHash,
    amount: order.amount,
    currency: order.currency,
  };
};

module.exports = {
  getActiveListings,
  getMyTicketsForResale,
  getMySales,
  getAdminResaleOrders,
  updateSellerPayoutStatus,
  createListing,
  cancelListing,
  createResaleCheckout,
  handleResalePaymentSucceeded,
  handleResalePaymentFailed,
  getResaleOrderStatus,
};
