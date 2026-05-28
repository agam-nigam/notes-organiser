const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        default: "New Note",
    },
    content: {
        type: String,
    },
    pinned: {
        type: Boolean,
        default: false
    },
    color: {
        type: String,
        default: "#FDFAF4"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const Note = mongoose.model("Note", noteSchema);


module.exports = Note;