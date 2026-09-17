const User = require('../models/user');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const transporter = require('./emailService');

const signupUser = async (email, password) => {

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("Email already registered");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = new User({
        email,
        password: hashedPassword,
        verified: false,
        verificationToken: verificationToken,
        verificationTokenExpires: Date.now() + 60 * 60 * 1000
    });

    await newUser.save();

    const verificationLink =
        `http://localhost:3000/api/verify-email/${verificationToken}`;

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

    return {
        message: "Registration successful. Please check your email to verify your account."
    };
};

const verifyEmailToken = async (token) => {

    const user = await User.findOne({
        verificationToken: token
    });

    if (!user) {
        throw new Error("Invalid verification link.");
    }

    if (user.verificationTokenExpires < Date.now()) {
        throw new Error("Verification link has expired.");
    }

    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    return "Email verified successfully! You can now log in.";
};

const loginUser = async (email, password) => {

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    if (!user.verified) {
        throw new Error("Please verify your email before logging in.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return {
        message: "Logged in successfully!",
        token: token,
        role: user.role
    };
};

module.exports = {
    signupUser,
    verifyEmailToken,
    loginUser
};