const express = require("express");
const cors = require("cors");
const { ObjectId } = require('mongodb'); // Ensure ObjectId is imported correctly
const { connectToDb, getDb } = require("./db");

const app = express();

// Use CORS middleware
app.use(cors()); // Ensure proper cross-origin requests

// Middleware to parse JSON request bodies
app.use(express.json());

// Connect to the database
connectToDb((err) => {
  if (!err) {
    app.listen(4000, () => {
      console.log("Server is running on port 4000");
    });
  } else {
    console.error("Failed to connect to the database.");
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("MongoDB API!");
});

// Fetch all books
app.get("/books", async (req, res) => {
  try {
    const db = getDb();
    const books = await db.collection("books").find().toArray();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve books" });
  }
});

// Fetch a book by ID
app.get("/books/:id", async (req, res) => {
  const db = getDb();
  const { id } = req.params;

  try {
    // Convert the string `id` to MongoDB `ObjectId`
    const book = await db.collection("books").findOne({ _id: new ObjectId(id) });
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ error: "Book not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the book" });
  }
});

