const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        unique: true,
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Password must be at least 8 characters long']
    },
    email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
},

    resetToken: String,
    resetTokenExpiry: Date
});

module.exports = mongoose.model("User", userSchema);