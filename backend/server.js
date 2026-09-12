const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const User = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Load environment variables from .env file
dotenv.config()

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

// Signup Route
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Scramble (hash) the password securely
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
         // Generate verification token
        const crypto = require('crypto');
        const verificationToken = crypto.randomBytes(32).toString('hex');

       
      // Create new user
        const newUser = new User({
            email,
            password: hashedPassword,
            verified: false,
            verificationToken: verificationToken,
            verificationTokenExpires: Date.now() + 60 * 60 * 1000
        });

        // Save user
        await newUser.save();

        // Create verification link
        const verificationLink =
            `http://localhost:3000/api/verify-email/${verificationToken}`;

        // Send verification email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verify Your Email",
            html: `
                <h2>Verify Your Email</h2>
                <p>Thank you for registering.</p>
                <p>Click the link below to verify your email:</p>
                <a href="${verificationLink}">Verify Email</a>
                <p>This link will expire in 1 hour.</p>
            `
        });

        res.status(201).json({
            message: "Registration successful. Please check your email to verify your account."
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Server error during signup"
        });
    }
});

// Email Verification Route
app.get('/api/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Find user with this verification token
        const user = await User.findOne({
            verificationToken: token
        });

        if (!user) {
            return res.status(400).send("Invalid verification link.");
        }

        // Check if token has expired
        if (user.verificationTokenExpires < Date.now()) {
            return res.status(400).send("Verification link has expired.");
        }

        // Verify the user's email
        user.verified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();

        res.send("Email verified successfully! You can now log in.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error during email verification.");
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Check if email is verified
        if (!user.verified) {
           return res.status(403).json({
               error: "Please verify your email before logging in."
        });
}

        // 2. Compare the submitted password with the hashed database password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // 3. Create a JWT token for authentication
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ 
            message: "Logged in successfully!", 
            token: token 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during login" });
    }
});

// 4. SECURITY GUARD MIDDLEWARE (Put this right before your protected routes)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; 
        next(); 
    } catch (err) {
        res.status(403).json({ error: "Invalid or expired token" });
    }
};

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