const API_URL = "http://localhost:4000/books";
let booksData = []; // Store fetched books globally
let sortField = ""; // Current field to sort by
let sortOrder = "asc"; // Sort order: "asc" or "desc"

document.addEventListener("DOMContentLoaded", () => {
  fetchBooks();

  document
    .getElementById("addBookForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("title").value;
      const author = document.getElementById("author").value;
      const publication_year = document.getElementById("publicationYear").value;
      const rating = document.getElementById("rating").value;
      const read_status = document.getElementById("readStatus").value;

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            author,
            publication_year,
            rating,
            read_status,
          }),
        });

        if (res.ok) {
          Swal.fire({
            title: "Success!",
            text: "The book has been added successfully.",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            fetchBooks();
            document.getElementById("addBookForm").reset();
          });
        } else {
          const errorData = await res.json();
          Swal.fire({
            title: "Error",
            text: errorData.error || "Failed to add the book.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "An unexpected error occurred.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    });

  // Add sorting functionality
  document.querySelectorAll(".sortable").forEach((header) => {
    header.addEventListener("click", () => {
      const field = header.dataset.field;
      sortOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
      sortField = field;
      fetchBooks();
    });
  });

  // Add filter inputs
  document.getElementById("filterInput").addEventListener("input", fetchBooks);
  document
    .getElementById("filterReadStatus")
    .addEventListener("change", fetchBooks);
});

async function fetchBooks() {
  try {
    const res = await fetch(API_URL);
    booksData = await res.json();

    // Apply filters
    const filterValue = document
      .getElementById("filterInput")
      .value.toLowerCase();
    const filterReadStatus = document.getElementById("filterReadStatus").value;
    let filteredBooks = booksData.filter((book) => {
      return (
        (book.title.toLowerCase().includes(filterValue) ||
          book.author.toLowerCase().includes(filterValue) ||
          book.publication_year.toString().includes(filterValue) ||
          book.rating.toString().includes(filterValue)) &&
        (filterReadStatus === "all" || book.read_status === filterReadStatus)
      );
    });

    // Apply sorting
    if (sortField) {
      filteredBooks.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    renderBooks(filteredBooks);
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

function renderBooks(books) {
  const bookList = document.getElementById("bookList");
  bookList.innerHTML = "";

  books.forEach((book) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.publication_year}</td>
      <td>
        <input type="number" class="input is-small" value="${
          book.rating
        }" step="0.1" min="0" max="5" onchange="updateBook('${
      book.id
    }', 'rating', this.value)">
      </td>
      <td>
        <div class="select is-small">
          <select onchange="updateBook('${
            book.id
          }', 'read_status', this.value)">
            <option value="to-read" ${
              book.read_status === "to-read" ? "selected" : ""
            }>To Read</option>
            <option value="reading" ${
              book.read_status === "reading" ? "selected" : ""
            }>Reading</option>
            <option value="read" ${
              book.read_status === "read" ? "selected" : ""
            }>Read</option>
          </select>
        </div>
      </td>
      <td>
        <button class="button is-small is-danger" onclick="confirmDeleteBook('${
          book.id
        }')">Delete</button>
      </td>
    `;
    bookList.appendChild(row);
  });
}

async function updateBook(id, field, value) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, value }),
    });
  } catch (error) {
    console.error("Error updating book:", error);
  }
}

async function confirmDeleteBook(id) {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This book will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    deleteBook(id);
  }
}

async function deleteBook(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchBooks();
  } catch (error) {
    console.error("Error deleting book:", error);
  }
}
