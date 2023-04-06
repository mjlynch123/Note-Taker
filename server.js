const express = require("express");
const path = require("path");
const fs = require("fs");
const uuid = require("./Helpers/uuid");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

// * Routing to the home page
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

// * Sending the user to the notes page
app.get("/notes", (req, res) => {
  res.sendFile(__dirname + "/public/notes.html");
});

// * Reading the data from the backend and transfering it to the frontend
app.get("/api/notes", (req, res) => {
  // * Read data from JSON file
  const data = JSON.parse(fs.readFileSync("./db/db.json", "utf8")) || [];

  // * Transfering that data to the frontend
  res.json(data);
});

// * Posting the notes that we have added
app.post("/api/notes", (req, res) => {
  // * We are reading the data from the file and assigning it to data, if data is empty we will assign it to an empty array
  const data = JSON.parse(fs.readFileSync("./db/db.json", "utf8")) || [];

  // * Getting items from request body
  const newNote = req.body;

  // * Making a new id for the note that will be added to the JSON file
  newNote.id = uuid();
  data.push(newNote);

  // * We are writing the item to the file and formatting it so that it looks nice
  fs.writeFileSync("./db/db.json", JSON.stringify(data, null, 4));

  // * Sending a success message
  res.json({ success: true });
});

// * This is the code for deleting an item
app.delete("/api/notes/:id", (req, res) => {
  const data = JSON.parse(fs.readFileSync("./db/db.json", "utf8"));
  const noteId = req.params.id;

  // * Finding the note with a matching ID
  const noteIndex = data.findIndex((note) => note.id === noteId);

  // * If that note is in the array then we will remove it from the array
  if (noteIndex !== -1) {
    data.splice(noteIndex, 1);
    // * Rewriting data to the file minus the note with the matching ID
    fs.writeFileSync("./db/db.json", JSON.stringify(data, null, 2));
    // * Printing success message
    res.json({ success: true });
  } else {
    // * Sending a failure message
    res.status(404).json({ error: "Note not found" });
  }
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
