const express = require('express');
const path = require('path');
const fs = require("fs");
const uuid = require('./Helpers/uuid');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// * Routing to the home page
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// * Sending the user to the notes page
app.get("/notes", (req, res) => {
    res.sendFile(__dirname + "/public/notes.html");
})

// * Reading the data from the backend and transfering it to the frontend
app.get("/api/notes", (req, res) => {
    // * Read data from JSON file
  const data = JSON.parse(fs.readFileSync("./db/db.json", "utf8")) || [];

  // * Transfering that data to the frontend
  res.json(data);
})

app.post("/api/notes", (req, res) => {
    // Read data from JSON file
  const data = JSON.parse(fs.readFileSync("./db/db.json", "utf8")) || [];

  // Add new note to data
  const newNote = req.body;
  newNote.id = uuid();
  data.push(newNote);

  // Write updated data to JSON file
  fs.writeFileSync("./db/db.json", JSON.stringify(data, null, 4));

  // Send success response
  res.json({ success: true });

})

app.delete("/api/notes/:id", (req, res) => {
    const data = JSON.parse(fs.readFileSync('./db/db.json', 'utf8'));
  const noteId = req.params.id;

  // Find the note with the matching ID
  const noteIndex = data.findIndex(note => note.id === noteId);

  // If the note is found, remove it from the array
  if (noteIndex !== -1) {
    data.splice(noteIndex, 1);
    fs.writeFileSync('./db/db.json', JSON.stringify(data, null, 2));
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Note not found' });
  }
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));