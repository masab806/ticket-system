const dotenv = require("dotenv");
// Load environment variables from .env file
dotenv.config();

const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")

const verifyToken = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');



const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))



app.use(cors({
    origin: "http://localhost:5173"
}))


// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err))
  
app.get("/api/message", (req, res) => {
    res.json({ message: "Hello from Express backend!" });
});  

// Auth Routes
app.use('/api', authRoutes);





// 5. PROTECTED ROUTE: Dashboard (Requires verifyToken middleware)
app.get('/api/dashboard', verifyToken, (req, res) => {
    res.json({ 
        message: "Welcome to your secure dashboard!", 
        user: req.user 
    });
});

app.listen(3000, ()=> {
    console.log("Server Is Running!")
})