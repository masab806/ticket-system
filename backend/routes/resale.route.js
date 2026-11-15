const express = require("express");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const resaleController = require("../controllers/ResaleController");

const router = express.Router();

router.use(verifyToken);
router.get("/listings", resaleController.getListings);
router.get("/mine", resaleController.getMyTickets);
router.get("/sales", resaleController.getMySales);
router.get("/admin/orders", requireAdmin, resaleController.getAdminOrders);
router.patch("/admin/orders/:orderId/payout", requireAdmin, resaleController.updateAdminPayout);
router.post("/listings", resaleController.createListing);
router.delete("/listings/:listingId", resaleController.cancelListing);
router.post("/listings/:listingId/checkout", resaleController.createCheckout);
router.get("/orders/:orderId", resaleController.getOrderStatus);

module.exports = router;
