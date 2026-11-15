const payoutService = require("../services/payoutService")

const getPayouts = async (req, res) => {
    try {
        const payouts = await payoutService.getPayouts(
            req.params.organizerId
        )

        res.status(200).json(payouts)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const createPayout = async (req, res) => {
    try {
        const payoutData = {
            ...req.body,
            organizer: req.params.organizerId
        }

        const payout = await payoutService.createPayout(payoutData)

        res.status(201).json(payout)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

module.exports = {
    getPayouts,
    createPayout
}