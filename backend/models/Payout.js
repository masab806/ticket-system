const mongoose = require("mongoose")

const payoutSchema = new mongoose.Schema(
    {
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending"
        },

        paidAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Payout", payoutSchema)