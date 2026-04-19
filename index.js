const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const Note = require("./models/note.js");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

main()
    .then(res => console.log("Connection Sucessful"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/notes_app");
}

// Initial testing route
// app.get("/", (req, res) => {
//     console.log("Working");
//     res.send("Working");
// });

// Index Route - shows all the notes
// app.get("/notes", async (req, res) => {
//     let notes = await Note.find();
//     res.render("home.ejs", { notes });
// });

app.get("/notes", async (req, res) => {
    let notes = await Note.find().sort({ updatedAt: -1, createdAt: -1 });

    const pinnedNotes = notes.filter(note => note.pinned);
    const otherNotes = notes.filter(note => !note.pinned);

    res.render("home.ejs", { pinnedNotes, otherNotes });
});

// Create Route - for new notes to add
app.get("/notes/create", (req, res) => {
    res.render("createNote.ejs");
});

// add to db new note
app.post("/notes", (req, res) => {
    let { title, content } = req.body;
    let newNote = new Note({
        title: title,
        content: content,
    });
    newNote.save().then(res => console.log(newNote, "Note saved.")).catch(err => console.log(err));

    res.redirect("/notes");
});

// Edit Route - change/update content
app.get("/notes/:id/edit", async (req, res) => {
    let { id } = req.params;
    let note = await Note.findById(id);
    res.render("editContent.ejs", { note });
});

// Applying changes in db
app.put("/notes/:id", async (req, res) => {
    let { id } = req.params;
    let { title: newTitle, content: newContent } = req.body;
    let updatedNote = await Note.findByIdAndUpdate(id, { title: newTitle, content: newContent }, { runValidators: true, new: true });
    console.log(updatedNote);
    res.redirect("/notes");
});

// Delete Route - to delete whole note
app.delete("/notes/:id", async (req, res) => {
    let { id } = req.params;
    let deletedNote = await Note.findByIdAndDelete(id);
    console.log("deletion sucessful");
    console.log(deletedNote);
    res.redirect("/notes");
});

// Search Route - implementing search feature
app.get("/notes/search", async (req, res) => {
    const { search } = req.query;

    let notes;
    if (search) {
        notes = await Note.find({
            $or: [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
            ]
        }).sort({createdAt: -1, updatedAt: -1});
    } else {
        // notes = await Note.find();
        res.render("emptySearch.ejs");
    }

    res.render("search.ejs", { notes, search });
});


// Pin Route
app.patch("/notes/:id", async (req, res) => {
    const { id } = req.params;
    const note = await Note.findById(id);
    const updatedNote = await Note.findByIdAndUpdate(id, { pinned: !note.pinned }, { runValidators: true, new: true });

    res.redirect("/notes");
});

app.listen(8080, () => {
    console.log("Server listening to port 8080");
});