# 📝 Notes Organiser

A full-stack notes management web application built with **Node.js**, **Express**, and **MongoDB**. Features a bold neo-brutalist UI with support for creating, editing, deleting, pinning, searching, and color-coding notes.

---

## 🖼️ Preview

> A fast, minimal notes app with a bold neo-brutalist design — dot-grid background, offset card shadows, sticky-note style pinned items, and user-defined card colors.

---

## ✨ Features

- 📌 **Pin / Unpin Notes** — Keep important notes at the top in a dedicated pinned section
- ✏️ **Create & Edit Notes** — Add a title and content, edit anytime
- 🗑️ **Delete Notes** — Permanently remove notes with a confirmation prompt
- 🎨 **Card Colors** — Choose from 7 preset colors for each note card at creation or edit time
- 🔍 **Search Notes** — Case-insensitive keyword search across title and content
- 🕐 **Smart Timestamps** — Automatically shows "Created" or "Updated" time based on note history
- 🔃 **Auto Sorted** — Notes sorted by most recently updated or created
- 📱 **Responsive Layout** — Works cleanly on both desktop and mobile

---

## 🛠️ Tech Stack

| Layer         | Technology                            |
|---------------|---------------------------------------|
| Runtime       | Node.js                               |
| Framework     | Express.js                            |
| Database      | MongoDB + Mongoose                    |
| Templating    | EJS (Embedded JavaScript)             |
| Styling       | Custom CSS (Neo-Brutalist Design)     |
| HTTP Override | method-override (PUT / PATCH / DELETE)|

---

## 📁 Project Structure

```
notes-organiser/
├── .vscode/
│   └── settings.json            # VS Code workspace settings
├── models/
│   └── note.js                  # Mongoose Note schema (title, content, color, pinned, timestamps)
├── public/
│   └── style.css                # Global stylesheet — neo-brutalist design
├── views/
│   ├── partials/
│   │   ├── colorPicker.ejs      # Reusable color swatch picker
│   │   ├── footer.ejs           # Reusable footer with links
│   │   └── noteCard.ejs         # Reusable note card component
│   ├── createNote.ejs           # Create new note form
│   ├── editContent.ejs          # Edit existing note form
│   ├── emptySearch.ejs          # No results fallback
│   ├── home.ejs                 # Home page — pinned & all notes grid
│   └── search.ejs               # Search results page
├── .gitignore                   # Ignores node_modules, .env, .vscode
├── index.js                     # Express app entry point
├── init.js                      # Database initialisation / seed script
├── LICENSE                      # MIT License
├── package-lock.json
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher
- [MongoDB](https://www.mongodb.com/) running locally

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/agam-nigam/notes-organiser.git
cd notes-organiser

# 2. Install dependencies
npm install

# 3. Start MongoDB locally
mongod

# 4. (Optional) Seed initial data
node init.js

# 5. Start the server
node index.js
```

Open your browser and visit **http://localhost:8080/notes**

---

## 🔗 Routes

| Method | Route             | Description                        |
|--------|-------------------|------------------------------------|
| GET    | `/notes`          | Home — pinned + all notes (sorted) |
| GET    | `/notes/create`   | Show create note form              |
| POST   | `/notes`          | Save new note to database          |
| GET    | `/notes/search`   | Search notes by title or content   |
| GET    | `/notes/:id/edit` | Show edit form for a note          |
| PUT    | `/notes/:id`      | Update title, content & color      |
| DELETE | `/notes/:id`      | Permanently delete a note          |
| PATCH  | `/notes/:id`      | Toggle pin / unpin on a note       |

---

## 🗄️ Database

Connects to a local MongoDB instance:

```
mongodb://127.0.0.1:27017/notes_app
```

The `Note` model uses Mongoose with `timestamps: true`, which automatically manages `createdAt` and `updatedAt` fields used for sorting and display.

### Note Schema

```js
{
  title:     String,
  content:   String,
  color:     { type: String, default: "#FDFAF4" },
  pinned:    { type: Boolean, default: false },
  createdAt: Date,   // auto
  updatedAt: Date    // auto
}
```

---

## 📦 Dependencies

```json
{
  "express":         "^4.x",
  "mongoose":        "^7.x",
  "ejs":             "^3.x",
  "method-override": "^3.x"
}
```

Install all with:

```bash
npm install express mongoose ejs method-override
```

---

## 🎨 Design

The UI follows a **neo-brutalist** design language:

- Dot-grid paper texture background
- Offset box shadows (`6px 6px 0 #1A1A1A`)
- Bold **Syne** typeface for headings, **DM Mono** for body text
- Pinned notes rendered as yellow sticky notes with a 📌 indicator
- 7 preset card colors selectable via visual swatch picker
- Orange-red (`#FF4F1F`) accent color throughout
- Fully responsive card grid layout

---

## 🙌 Acknowledgements

- [Google Fonts](https://fonts.google.com/) — Syne & DM Mono
- [MongoDB Docs](https://www.mongodb.com/docs/)
- [Express.js Docs](https://expressjs.com/)

---

## 👤 Author

**Agam Nigam**
- GitHub: [agam-nigam](https://github.com/agam-nigam)
- LinkedIn: [Agam Nigam](https://linkedin.com/in/agam-n)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).