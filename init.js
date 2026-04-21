const mongoose = require("mongoose");
const Note = require("./models/note.js");

main()
    .then(res => console.log("Connection Sucessful"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/notes_app");
}

const sampleNotes = [
    {
        title: "Daily Goals",
        content: "Complete DSA practice, revise DBMS, and go for a 30-minute walk.",
    },
    {
        title: "Project Ideas",
        content: "Build a notes app with authentication, search, and tagging features.",
    },
    {
        title: "Shopping List",
        content: "Milk, Bread, Eggs, Notebook, Pen",
    },
    {
        title: "Travel Plan",
        content: "Visit Sikkim in June. Plan itinerary for Gangtok, Pelling, and Lachung.",
    },
    {
        title: "Random Thoughts",
        content: "Consistency beats motivation. Focus on small daily improvements.",
    },
    {
        title: "Meeting Notes",
        content: "Discussed API structure, deadlines, and deployment strategy.",
    }
];

Note.insertMany(sampleNotes);