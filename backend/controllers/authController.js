const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../services/emailService');

//signup route into function
const signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                error: "Email already registered"
            });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate verification token
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
};

//email verrification route into function
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            verificationToken: token
        });

        if (!user) {
            return res.status(400).send("Invalid verification link.");
        }

        if (user.verificationTokenExpires < Date.now()) {
            return res.status(400).send("Verification link has expired.");
        }

        user.verified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();

        res.send("Email verified successfully! You can now log in.");

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error during email verification.");
    }
};

//login route to function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                error: "Invalid email or password"
            });
        }

        // Check if email is verified
        if (!user.verified) {
            return res.status(403).json({
                error: "Please verify your email before logging in."
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(400).json({
                error: "Invalid email or password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        res.status(200).json({
            message: "Logged in successfully!",
            token: token,
            role: user.role
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Server error during login"
        });
    }
};

module.exports = {
    signup,
    verifyEmail,
    login
};