const resaleService = require("../services/Resale.service");

const handle = (action) => async (req, res) => {
  try {
    const result = await action(req);
    res.json(result);
  } catch (error) {
    console.error("Resale request failed:", error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Resale request failed",
    });
  }
};

const getListings = handle((req) => resaleService.getActiveListings(req.user.userId));
const getMyTickets = handle((req) => resaleService.getMyTicketsForResale(req.user.userId));
const getMySales = handle((req) => resaleService.getMySales(req.user.userId));
const getAdminOrders = handle(() => resaleService.getAdminResaleOrders());
const updateAdminPayout = handle((req) =>
  resaleService.updateSellerPayoutStatus({
    orderId: req.params.orderId,
    adminId: req.user.userId,
    paid: req.body.paid,
  })
);
const createListing = handle((req) =>
  resaleService.createListing({
    userId: req.user.userId,
    ticketId: req.body.ticketId,
    price: req.body.price,
  })
);
const cancelListing = handle((req) =>
  resaleService.cancelListing({ listingId: req.params.listingId, userId: req.user.userId })
);
const createCheckout = handle((req) =>
  resaleService.createResaleCheckout({
    listingId: req.params.listingId,
    buyerId: req.user.userId,
    walletAddress: req.body.walletAddress,
  })
);
const getOrderStatus = handle((req) =>
  resaleService.getResaleOrderStatus({ orderId: req.params.orderId, userId: req.user.userId })
);

module.exports = {
  getListings,
  getMyTickets,
  getMySales,
  getAdminOrders,
  updateAdminPayout,
  createListing,
  cancelListing,
  createCheckout,
  getOrderStatus,
};
