require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const User = require("./models/user.js");
const transporter = require("./utils/mailer.js");

// ─── App Settings ────────────────────────
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ─── Middleware ──────────────────────────
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// ─── Session ─────────────────────────────
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL || "mongodb://127.0.0.1:27017/notes_app"
    })
}));

const flash = require("connect-flash");
app.use(flash());

// make flash messages available in all views
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// ─── Passport ────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({ username });
    if (!user) return done(null, false);
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return done(null, false);
    return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

// ─── Routes ──────────────────────────────
const noteRoutes = require("./routes/notes.js");
const authRoutes = require("./routes/auth.js");
app.use(noteRoutes);
app.use(authRoutes);

// ─── Database ────────────────────────────
main()
    .then(() => console.log("Connection Successful"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/notes_app");
}

// ─── Server ──────────────────────────────
app.listen(8080, () => {
    console.log("Server listening to port 8080");
});