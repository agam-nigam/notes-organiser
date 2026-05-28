const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/user.js");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const transporter = require("../utils/mailer.js");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many login attempts, please try again after 15 minutes"
});

// Register
router.get("/register", (req, res) => {
    res.render("register.ejs");
});

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    // password validation
    if (password.length < 8) {
        req.flash("error", "Password must be at least 8 characters");
        return res.redirect("/register");
    }

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
    const user = new User({
        username,
        email,
        password: hashed
    });

    await user.save();
    req.flash("success", "Account created! Please login");
    res.redirect("/login");
});

// Login
router.get("/login", (req, res) => {
    res.render("login.ejs");
});

router.post("/login", (req, res, next) => {
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
        res.redirect("/login");
    });
});

// Password reset 
router.get("/forgot-password", (req, res) => {
    res.render("forgotPassword.ejs");
});

router.post("/forgot-password", async (req, res) => {
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
    const resetURL =
        `http://localhost:8080/reset-password/${token}`;

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: user.email,
        subject: "Password Reset",
        html: `
            <p>Click below to reset password:</p>
            <a href="${resetURL}">
                Reset Password
            </a>
        `
    });

    req.flash(
        "success",
        "Password reset email sent."
    );

    res.redirect("/login");
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

    res.redirect("/login");
});

module.exports = router; 