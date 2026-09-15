const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const EventRouter = require("./routes/EventTicket.route")

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(cors({
    origin: "http://localhost:5173"
}))

app.use("/api/events", EventRouter)

app.listen(3000, ()=> {
    console.log("Server Is Running!")
})