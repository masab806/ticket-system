const mongoose = require("mongoose")

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        slug: {
            type: String,
            required: true,
            unique: true
        },

        date: {
            type: Date,
            required: true
        },

        city: {
            type: String,
            required: true
        },

        image: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["On sale", "Sold out", "Draft", "Past"],
            default: "Draft"
        },

        capacity: {
            type: Number,
            required: true
        },

        sold: {
            type: Number,
            default: 0
        },

        gross: {
            type: Number,
            default: 0
        },

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Event", eventSchema)