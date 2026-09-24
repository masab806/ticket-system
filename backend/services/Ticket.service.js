const { Ticket } = require("../models/Ticket");

const getUserTickets = async (userId) => {
  const tickets = await Ticket.find({ user: userId })
    .populate("eventId", "name title startsAt venue bannerUrl ticketPrice currency")
    .sort({ createdAt: -1 })
    .lean();

  return tickets.map((ticket) => {
    const event = ticket.eventId || {};
    const venue = typeof event.venue === "object" && event.venue !== null
      ? event.venue
      : {};

    return {
      id: ticket._id.toString(),
      ticketId: `#TCK-${ticket.tokenId}`,
      tokenId: ticket.tokenId,
      eventId: event._id?.toString(),
      eventTitle: event.title || event.name || "Untitled Event",
      image: event.bannerUrl || "/placeholder.svg",
      date: event.startsAt ? new Date(event.startsAt).toISOString() : null,
      time: event.startsAt ? new Date(event.startsAt).toISOString() : null,
      venue: venue.name || "Venue TBA",
      city: venue.city || "Unspecified",
      tier: "General Admission",
      seat: "General Admission",
      status: ticket.status === "used" ? "Used" : "Valid",
      txHash: ticket.mintTxHash,
      owner: ticket.walletAddress,
      qrToken: ticket.tokenId,
      pricePaid: ticket.pricePaid,
      currency: ticket.currency || event.currency,
    };
  });
};

module.exports = { getUserTickets };
