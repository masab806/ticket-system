const express = require("express");
const organizerController = require("../controllers/organizerController");
const { uploadEventThumbnail } = require("../middleware/eventThumbnailUpload");
const {
    verifyToken,
    requireOrganizer
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/events/:organizerId",
    verifyToken,
    requireOrganizer,
    organizerController.getEvents
);

router.post(
    "/events/:organizerId",
    verifyToken,
    requireOrganizer,
    uploadEventThumbnail,
    organizerController.createEvent
);

router.put(
    "/events/:eventId",
    verifyToken,
    requireOrganizer,
    organizerController.updateEvent
);

router.delete(
    "/events/:eventId",
    verifyToken,
    requireOrganizer,
    organizerController.deleteEvent
);

router.get(
    "/dashboard/:organizerId",
    verifyToken,
    requireOrganizer,
    organizerController.getDashboard
);

module.exports = router;
