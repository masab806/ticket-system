const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    venue: {
      name: { type: String, trim: true },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      country: { type: String, trim: true, default: "Pakistan" },
    },
    startsAt: {
      type: Date,
      required: true,
      index: true,
    },
    endsAt: {
      type: Date,
    },
    bannerUrl: {
      type: String,
      trim: true,
    },

    ticketPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      enum: ["PKR", "USD"],
      default: "PKR",
    },

    // The contract has no per-event cap — it just mints and counts
    // globally — so supply tracking is entirely your database's job here.
    totalTickets: {
      type: Number,
      required: true,
      min: 1,
    },
    mintedTickets: {
      // Increment this yourself each time a mint for this event succeeds
      // (e.g. right after you insert the Ticket documents).
      type: Number,
      default: 0,
      min: 0,
    },

    gross: {
      type: Number,
      default: 0,
      min: 0,
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "draft",
      index: true,
    },
  },
  { timestamps: true }
);

EventSchema.methods.remainingTickets = function () {
  return this.totalTickets - this.mintedTickets;
};

EventSchema.methods.isSoldOut = function () {
  return this.mintedTickets >= this.totalTickets;
};

const Event = mongoose.model("Event", EventSchema);

module.exports = {
  Event,
};