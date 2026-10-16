const paymentHistoryService = require("../services/PaymentHistory.service");

const getMyPaymentHistory = async (req, res) => {
  try {
    const history = await paymentHistoryService.getUserPaymentHistory(req.user.userId);
    res.status(200).json(history);
  } catch (error) {
    console.error("getMyPaymentHistory error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch transaction history" });
  }
};

module.exports = { getMyPaymentHistory };
