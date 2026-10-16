const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { getMyPaymentHistory } = require("../controllers/PaymentHistoryController");
const {
  createPaymentIntent,
} = require("../controllers/PaymentController");

router.post("/create-intent", verifyToken, createPaymentIntent);
router.get("/history", verifyToken, getMyPaymentHistory);

module.exports = router;
