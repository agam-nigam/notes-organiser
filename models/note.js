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
}, { timestamps: true });

const Note = mongoose.model("Note", noteSchema);


module.exports = Note;