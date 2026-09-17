const express = require("express")
const payoutController = require("../controllers/payoutController")

const router = express.Router()

router.get("/:organizerId", payoutController.getPayouts)

router.post("/:organizerId", payoutController.createPayout)

module.exports = router