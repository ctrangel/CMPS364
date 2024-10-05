const express = require("express");
const cors = require("cors"); // Import cors
const { connectToDb, getDb } = require("./db");

const app = express();

// Use CORS middleware
app.use(cors());

connectToDb((err) => {
  if (!err) {
    app.listen(4000, () => {
      console.log("Server is running on port 4000");
    });
  } else {
    console.error("Failed to connect to the database.");
  }
});

app.use(express.json()); // Allows parsing JSON bodies in requests

app.get("/", (req, res) => {
  res.send("MongoDB API!");
});

app.get("/books", async (req, res) => {
  try {
    const db = getDb();
    const books = await db.collection("books").find().toArray();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve books" });
  }
});

// Other routes remain unchanged
app.get("/books/:id", async (req, res) => {
  const db = getDb();
  const { id } = req.params;

  try {
    const book = await db
      .collection("books")
      .findOne({ _id: new ObjectId(id) });
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ error: "Book not found" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the book" });
  }
});

app.post("/books", async (req, res) => {
  const db = getDb();
  const newBook = req.body; // Expect the request body to contain book details

  try {
    const result = await db.collection("books").insertOne(newBook);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: "Could not add the book" });
  }
});

app.put("/books/:id", async (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const result = await db
      .collection("books")
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedData });
    if (result.modifiedCount > 0) {
      res.json({ message: "Book updated successfully" });
    } else {
      res.status(404).json({ error: "Book not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Could not update the book" });
  }
});

app.delete("/books/:id", async (req, res) => {
  const db = getDb();
  const { id } = req.params;

  try {
    const result = await db
      .collection("books")
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount > 0) {
      res.json({ message: "Book deleted successfully" });
    } else {
      res.status(404).json({ error: "Book not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Could not delete the book" });
  }
});

app.get("/books/search", async (req, res) => {
  const db = getDb();
  const { title, author } = req.query;

  let query = {};
  if (title) {
    query.title = { $regex: title, $options: "i" }; // Case-insensitive search
  }
  if (author) {
    query.author = { $regex: author, $options: "i" };
  }

  try {
    const books = await db.collection("books").find(query).toArray();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Could not search for books" });
  }
});

app.get("/books/sort", async (req, res) => {
  const db = getDb();
  const { field, order } = req.query;

  let sort = {};
  sort[field] = order === "asc" ? 1 : -1;

  try {
    const books = await db.collection("books").find().sort(sort).toArray();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Could not sort books" });
  }
});
