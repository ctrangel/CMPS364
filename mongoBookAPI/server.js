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




// Fetch by title                                  ######################### Module 8 add &&&&&&&&&&&&&&&&&&&&&&&&&&
app.get("/books/title/:title", async (req, res) => {
  const db = getDb();
  const { title } = req.params;

  try {
    const book = await db.collection("books").findOne({ title });
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ error: "Book not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the book" });
  }
});

// maybe we could perhaps add a book or two???     ######################### Module 8 add &&&&&&&&&&&&&&&&&&&&&&&&&&

app.post("/books", async (req, res) => {
  const db = getDb();
  const { title, author, shelves, avg_rating } = req.body;

  // Validate the input
  if (!title || !author || !shelves || avg_rating === undefined) {
    return res
      .status(400)
      .json({ error: "Title, author, shelves, and avg_rating are required." });
  }

  const newBook = {
    title,
    author,
    shelves,
    avg_rating,
  };

  try {
    const result = await db.collection("books").insertOne(newBook);
    res.status(201).json({
      message: "Book successfully added!",
      // return the newly added book
      book: newBook,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add the book" });
  }
});

