const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

let db;

connectToDb((err) => {
  if (!err) {
    db = getDb();
    app.listen(4000, () => {
      console.log("Server is running on port 4000");
    });
  } else {
    console.error("Failed to connect to the database.");
  }
});

// Fetch all books
app.get("/books", async (req, res) => {
  try {
    const books = await db.collection("books").find().toArray();
    res.json(
      books.map((book) => ({
        id: book._id,
        title: book.title,
        author: book.author,
        publication_year: book.publication_year,
        rating: book.rating,
        read_status: book.read_status,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve books" });
  }
});

// Add a new book
app.post("/books", async (req, res) => {
  const { title, author, publication_year, rating, read_status } = req.body;

  if (!title || !author || !publication_year || !rating || !read_status) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const result = await db.collection("books").insertOne({
      title,
      author,
      publication_year,
      rating,
      read_status,
    });
    res
      .status(201)
      .json({
        id: result.insertedId,
        title,
        author,
        publication_year,
        rating,
        read_status,
      });
  } catch (error) {
    res.status(500).json({ error: "Failed to add the book" });
  }
});

// Update a book
app.put("/books/:id", async (req, res) => {
  const { id } = req.params;
  const { field, value } = req.body;

  if (!field || value === undefined) {
    return res.status(400).json({ error: "Field and value are required." });
  }

  try {
    const result = await db
      .collection("books")
      .updateOne({ _id: new ObjectId(id) }, { $set: { [field]: value } });
    res.json({
      message: "Book updated successfully",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update the book" });
  }
});

// Delete a book
app.delete("/books/:id", async (req, res) => {
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
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the book" });
  }
});
