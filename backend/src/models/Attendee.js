const mongoose = require("mongoose")

const attendeeSchema = new mongoose.Schema(
    {
        wallet: {
            type: String,
            required: true
        },

        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },

        tier: {
            type: String,
            required: true
        },

        purchased: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["Valid", "Checked in", "Resold"],
            default: "Valid"
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Attendee", attendeeSchema)