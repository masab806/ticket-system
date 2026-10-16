const dotenv = require("dotenv")
dotenv.config()
const express = require("express")
const cors = require("cors")
const EventRouter = require("./routes/EventTicket.route")
const mongoose = require("mongoose")

const {verifyToken, requireOrganizer} = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const organizerRoutes = require("./routes/organizerRoutes")
const attendeeRoutes = require("./routes/attendeeRoutes")
const payoutRoutes = require("./routes/payoutRoutes")
const EventRoutes = require("./routes/EventRoute")
const connectDB = require("./config/db")

// ADD — payment imports
const { stripeWebhook } = require("./controllers/PaymentController");
const paymentRoutes = require("./routes/payment.route");
const ticketRoutes = require("./routes/Ticket.route");

const app = express()

// ADD — webhook route MUST come before express.json(), needs raw body
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use(cors({
    origin: "http://localhost:5173"
}))

app.use("/api/organizer", organizerRoutes)
app.use("/api/organizer/attendees", attendeeRoutes)
app.use("/api/organizer/payouts", payoutRoutes)
app.use("/api/events", EventRoutes)
app.use("/api/tickets", ticketRoutes)

connectDB()

app.get("/", (req, res) => {
    res.send("Server Is Running!")
})

app.use("/api/events", EventRouter)

// ADD — normal payment routes (create-intent etc.), after express.json()
app.use("/api/payments", paymentRoutes)

  
app.get("/api/message", (req, res) => {
    res.json({ message: "Hello from Express backend!" });
});  

// Auth Routes
app.use('/api/auth', authRoutes);

app.get('/api/dashboard', verifyToken, (req, res) => {
    res.json({ 
        message: "Welcome to your secure dashboard!", 
        user: req.user 
    });
});

app.get('/api/dashboard2', verifyToken, requireOrganizer, (req, res) => {
    res.json({
        message: "Welcome to the organizer dashboard!",
        user: req.user
    });
});

app.listen(3000, (req, res) => {
    console.log("Server Is Running")
})