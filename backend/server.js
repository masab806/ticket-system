const dotenv = require("dotenv")
dotenv.config()
const express = require("express")
const cors = require("cors")
const EventRouter = require("./routes/EventTicket.route")
const mongoose = require("mongoose")

const {verifyToken, requireOrganizer} = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');

// ADD — payment imports
const { stripeWebhook } = require("./controllers/payment.controller");
const paymentRoutes = require("./routes/payment.route");

const app = express()

// ADD — webhook route MUST come before express.json(), needs raw body
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(cors({
    origin: "http://localhost:5173"
}))

app.use("/api/events", EventRouter)

// ADD — normal payment routes (create-intent etc.), after express.json()
app.use("/api/payments", paymentRoutes)

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err))
  
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

app.listen(3000, ()=> {
    console.log("Server Is Running!")
})