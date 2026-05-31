const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/user.js");
const crypto = require("crypto");
const sendResetEmail = require("../utils/mailer.js");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    // message: "Too many login attempts, please try again after 15 minutes"
    handler: (req, res) => {
        req.flash(
            "error",
            "Too many login attempts. Please try again after 15 minutes."
        );

        return res.redirect("/login");
    }
});

// Register
router.get("/register", (req, res) => {
    res.render("register.ejs");
});

const commonPasswords = [
    "12345678", "password", "password123", "123456789", "qwerty123", "qwerty1234" , "admin123", "letmein123"
];

router.post("/register", async (req, res) => {
    let { username, password, email } = req.body;

    // username
    if (username.length < 3 || username.length > 20) {
        req.flash("error", "Username must be between 3 and 20 characters");
        return res.redirect("/register");
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(username)) {
        req.flash("error", "Username must start with a letter and contain only letters, numbers or underscores");
        return res.redirect("/register");
    }

    // password
    if (password.length < 8) {
        req.flash("error", "Password must be at least 8 characters");
        return res.redirect("/register");
    }
    if (password.length > 128) {
        req.flash("error", "Password cannot exceed 128 characters");
        return res.redirect("/register");
    }
    if (commonPasswords.includes(password.toLowerCase())) {
        req.flash("error", "Password is too common, please choose a stronger one");
        return res.redirect("/register");
    }

    // email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        req.flash("error", "Please enter a valid email address");
        return res.redirect("/register");
    }

    // store username as lowercase
    username = username.toLowerCase();
    // store email as lowercase
    email = email.toLowerCase();
    
    // username check
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        req.flash("error", "Username already taken");
        return res.redirect("/register");
    }

    // email check
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        req.flash("error", "Email already registered");
        return res.redirect("/register");
    }

    // hash password
    const hashed = await bcrypt.hash(password, 12);

    // create user
    const user = new User({ username, email, password: hashed });
    await user.save();

    req.flash("success", "Account created! Please login");
    res.redirect("/login");
});

// Login
router.get("/login", (req, res) => {
    res.render("login.ejs");
});

router.post("/login", loginLimiter, (req, res, next) => {
    passport.authenticate("local", (err, user) => {
        if (err) return next(err);
        if (!user) {
            req.flash("error", "Invalid username or password");
            return res.redirect("/login");
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome back!");
            return res.redirect("/notes");
        });
    })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
    req.logout(() => {
        req.flash("success", "Logged out successfully");
        return res.redirect("/login");
    });
});

// Password reset 
router.get("/forgot-password", (req, res) => {
    res.render("forgotPassword.ejs");
});

router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            req.flash("error", "No account found.");
            return res.redirect("/forgot-password");
        }
        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;

        const THIRTY_MINUTES = 1000 * 60 * 30;
        user.resetTokenExpiry = Date.now() + THIRTY_MINUTES;
        await user.save();

        const resetURL = `${process.env.BASE_URL}/reset-password/${token}`;
        await sendResetEmail(
            user.email,
            resetURL
        );
        req.flash(
            "success",
            "Password reset email sent."
        );
        return res.redirect("/login");
    } catch (err) {
        console.error("Forgot Password Error:", err);
        req.flash(
            "error",
            "Failed to send reset email."
        );
        return res.redirect("/forgot-password");
    }
});

router.get("/reset-password/:token", async (req, res) => {
    const user = await User.findOne({
        resetToken: req.params.token,
        resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
        req.flash("error", "Invalid or expired token.");
        return res.redirect("/forgot-password");
    }

    res.render("resetPassword.ejs", {
        token: req.params.token
    });
});

router.post("/reset-password/:token", async (req, res) => {
    const user = await User.findOne({
        resetToken: req.params.token,
        resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
        req.flash("error", "Token expired.");
        return res.redirect("/forgot-password");
    }

    const hashed = await bcrypt.hash(req.body.password, 12);
    user.password = hashed;

    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    req.flash(
        "success",
        "Password reset successful."
    );

    return res.redirect("/login");
});

module.exports = router; 