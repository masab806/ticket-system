const Payout = require("../models/Payout")

const getPayouts = async (organizerId) => {
    const payouts = await Payout.find({
        organizer: organizerId
    }).populate("event", "title")

    return payouts
}

const createPayout = async (payoutData) => {
    const payout = await Payout.create(payoutData)

    return payout
}

module.exports = {
    getPayouts,
    createPayout
}