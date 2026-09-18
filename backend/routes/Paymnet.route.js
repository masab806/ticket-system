const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { createPaymentIntent } = require("../controllers/payment.controller");

router.post("/create-intent", verifyToken, createPaymentIntent);

module.exports = router;