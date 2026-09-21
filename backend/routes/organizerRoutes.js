const express = require("express")
const organizerController = require("../controllers/organizerController")

const router = express.Router()

router.get("/events/:organizerId", organizerController.getEvents)
router.post("/events/:organizerId", organizerController.createEvent)
router.put("/events/:eventId", organizerController.updateEvent)
router.delete("/events/:eventId", organizerController.deleteEvent)
router.get("/dashboard/:organizerId", organizerController.getDashboard)

module.exports = router