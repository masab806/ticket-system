const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const connectDB = require("./config/db")
const organizerRoutes = require("./routes/organizerRoutes")
const attendeeRoutes = require("./routes/attendeeRoutes")
const payoutRoutes = require("./routes/payoutRoutes")

dotenv.config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use(cors({
    origin: "http://localhost:5173"
}))

app.use("/api/organizer", organizerRoutes)
app.use("/api/organizer/attendees", attendeeRoutes)
app.use("/api/organizer/payouts", payoutRoutes)

connectDB()

app.get("/", (req, res) => {
    res.send("Server Is Running!")
})

app.listen(3000, () => {
    console.log("Server Is Running!")
})