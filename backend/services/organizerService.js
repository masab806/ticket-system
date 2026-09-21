const { Event } = require("../models/Event");

// Helper function to map DB event documents to frontend expectations
const formatEventForClient = (event) => {
  const doc = event.toObject ? event.toObject() : event;
  
  return {
    ...doc,
    id: doc._id?.toString() || doc.id,
    title: doc.title || doc.name || "Untitled Event",
    date: doc.startsAt ? new Date(doc.startsAt).toISOString() : "N/A",
    capacity: doc.capacity ?? doc.totalTickets ?? 0,
    sold: doc.sold ?? doc.mintedTickets ?? 0,
    gross: doc.gross ?? ((doc.mintedTickets || 0) * (doc.ticketPrice || 0)),
    city: doc.city || "Unspecified",
    image: doc.image || "",
    status: doc.status || "draft",
  };
};

const getEvents = async (organizerId) => {
  const events = await Event.find({ organizer: organizerId }).sort({ createdAt: -1 });
  return events.map(formatEventForClient);
};

const createEvent = async (eventData) => {
  // Map frontend field names to backend schema if coming from UI
  const payload = {
    ...eventData,
    name: eventData.name || eventData.title,
    startsAt: eventData.startsAt || eventData.date,
    totalTickets: eventData.totalTickets ?? eventData.capacity,
  };

  // Generate a basic slug if one isn't explicitly provided
  if (!payload.slug && payload.name) {
    payload.slug = `${payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
  }

  const newEvent = await Event.create(payload);
  return formatEventForClient(newEvent);
};

const updateEvent = async (eventId, eventData) => {
  const updated = await Event.findByIdAndUpdate(eventId, eventData, {
    new: true,
    runValidators: true,
  });
  return updated ? formatEventForClient(updated) : null;
};

const deleteEvent = async (eventId) => {
  return await Event.findByIdAndDelete(eventId);
};

const getDashboard = async (organizerId) => {
  const rawEvents = await Event.find({ organizer: organizerId }).sort({ createdAt: -1 });

  const grossRevenue = rawEvents.reduce(
    (sum, event) => sum + (event.gross || ((event.mintedTickets || 0) * (event.ticketPrice || 0))),
    0
  );

  // Using mintedTickets property defined in EventSchema
  const ticketsSold = rawEvents.reduce(
    (sum, event) => sum + (event.mintedTickets || 0),
    0
  );

  const averageTicketPrice =
    ticketsSold > 0 ? grossRevenue / ticketsSold : 0;

  // Aggregate monthly revenues safely
  const monthlyMap = {};
  rawEvents.forEach((event) => {
    const eventDate = event.createdAt || event.startsAt;
    if (eventDate && !isNaN(new Date(eventDate).getTime())) {
      const month = new Date(eventDate).toLocaleString("en-US", {
        month: "short",
      });
      const eventGross = event.gross || ((event.mintedTickets || 0) * (event.ticketPrice || 0));
      monthlyMap[month] = (monthlyMap[month] || 0) + eventGross;
    }
  });

  const revenueChart = Object.keys(monthlyMap).map((month) => ({
    month,
    revenue: monthlyMap[month],
  }));

  // Format all events for UI safety
  const events = rawEvents.map(formatEventForClient);

  return {
    grossRevenue,
    ticketsSold,
    averageTicketPrice,
    resaleVolume: 0,
    revenueChart,
    events,
  };
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getDashboard,
};