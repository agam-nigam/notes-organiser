const express = require("express");
const router = express.Router();
const Note = require("../models/note.js");
const isLoggedIn = require("../middleware/isLoggedIn.js");

router.get("/", isLoggedIn, (req, res) => {
    res.redirect("/notes");
});

router.get("/notes", isLoggedIn, async (req, res) => {
    try {
        let notes = await Note.find({
            owner: req.user._id
        }).sort({
            pinned: -1,
            updatedAt: -1,
            createdAt: -1
        });

        const pinnedNotes = notes.filter(note => note.pinned);
        const otherNotes = notes.filter(note => !note.pinned);

        return res.render("home.ejs", {
            pinnedNotes,
            otherNotes,
            currentUser: req.user
        });

    } catch (err) {
        console.log(err);

        req.flash("error", "Failed to load notes.");

        return res.redirect("/");
    }
});

// Create Route - for new notes to add
router.get("/notes/create", isLoggedIn, (req, res) => {
    res.render("createNote.ejs");
});

// add to db new note
router.post("/notes", isLoggedIn, async (req, res) => {
    let { title, content, color } = req.body;

    if (title.length > 100) {
        req.flash("error", "Title cannot exceed 100 characters");
        return res.redirect("/notes/create");
    }

    title = title.trim();
    content = content.trim();

    // prevent empty note
    if (!title && !content) {
        req.flash("error", "Note cannot be empty.");
        return res.redirect("/notes/new");
    }

    try {
        let newNote = new Note({
            title,
            content,
            color,
            owner: req.user._id
        });

        await newNote.save();

        req.flash("success", "Note created successfully.");
        res.redirect("/notes");

    } catch (err) {
        console.log(err);
        req.flash("error", "Failed to create note.");
        res.redirect("/notes/new");
    }
});

// Edit Route - change/update content
router.get("/notes/:id/edit", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findOne({
            _id: id,
            owner: req.user._id
        });
        if (!note) {
            req.flash("error", "Note not found.");
            return res.redirect("/notes");
        }
        return res.render("editContent.ejs", {
            note
        });
    } catch (err) {
        console.log(err);
        req.flash("error", "Failed to load note.");
        return res.redirect("/notes");
    }
});

// Applying changes in db
router.put("/notes/:id", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        let {
            title: newTitle,
            content: newContent,
            color: newColor
        } = req.body;
        newTitle = newTitle?.trim() || "";
        newContent = newContent?.trim() || "";
        // Prevent empty note
        if (!newTitle && !newContent) {
            req.flash("error", "Note cannot be empty.");
            return res.redirect(`/notes/${id}/edit`);
        }
        const updatedNote = await Note.findOneAndUpdate(
            {
                _id: id,
                owner: req.user._id
            },
            {
                title: newTitle,
                content: newContent,
                color: newColor
            },
            {
                runValidators: true,
                new: true
            }
        );
        if (!updatedNote) {
            req.flash("error", "Note not found.");
            return res.redirect("/notes");
        }
        req.flash("success", "Note updated successfully.");
        return res.redirect("/notes");
    } catch (err) {
        console.log(err);
        req.flash("error", "Failed to update note.");
        return res.redirect("/notes");
    }
});

// Delete Route - to delete whole note
router.delete("/notes/:id", isLoggedIn, async (req, res) => {
    try {
        let { id } = req.params;
        let deletedNote = await Note.findOneAndDelete({
            _id: id,
            owner: req.user._id
        });
        console.log("deletion successful");
        console.log(deletedNote);
        req.flash("success", "Note deleted successfully.");
        res.redirect("/notes");
    } catch (err) {
        console.log(err);
        req.flash("error", "Failed to delete note.");
        res.redirect("/notes");
    }
});

// Search Route - implementing search feature
router.get("/notes/search", isLoggedIn, async (req, res) => {
    try {
        const search = req.query.search?.trim();
        if (!search) {
            return res.render("emptySearch.ejs");
        }
        const notes = await Note.find({
            owner: req.user._id,
            $or: [
                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    content: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ]
        }).sort({
            pinned: -1,
            updatedAt: -1,
            createdAt: -1
        });
        return res.render("search.ejs", {
            notes,
            search
        });
    } catch (err) {
        console.log(err);
        req.flash("error", "Search failed.");
        return res.redirect("/notes");
    }
});


// Pin Route
router.patch("/notes/:id", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findOne({
            _id: id,
            owner: req.user._id
        });
        if (!note) {
            req.flash("error", "Note not found.");
            return res.redirect("/notes");
        }
        await Note.findOneAndUpdate(
            {
                _id: id,
                owner: req.user._id
            },
            {
                pinned: !note.pinned
            },
            {
                timestamps: false
            }
        );
        return res.redirect("/notes");
    } catch (err) {
        console.log(err);
        req.flash("error", "Failed to pin note.");
        return res.redirect("/notes");
    }
});

module.exports = router;