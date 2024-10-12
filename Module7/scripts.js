let currentPage = 1;
const booksPerPage = 5;
let booksData = [];
let sortedBooksData = [];
let currentSort = "default";

fetch("http://localhost:4000/books")
  .then((response) => response.json())
  .then((data) => {
    booksData = data;
    sortedBooksData = [...booksData];
    displayBooks();
    updatePageInfo();
  })
  .catch((error) => console.error("Error fetching book data:", error));

function displayBooks() {
  const bookContainer = document.getElementById("book-container");
  bookContainer.innerHTML = "";

  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const booksToShow = sortedBooksData.slice(startIndex, endIndex);

  booksToShow.forEach((book) => {
    const bookCard = document.createElement("div");
    bookCard.classList.add("book-card");
    bookCard.innerHTML = `
            <div class="book-title">${book.title}</div>
            <div class="book-author">${book.author}</div>
            <div class="book-shelves"><strong>Shelves:</strong> ${book.shelves}</div>
            <div class="book-rating"><strong>Avg Rating:</strong> ${book.avg_rating}</div>
          `;
    bookContainer.appendChild(bookCard);
  });

  document.getElementById("prevBtn").disabled = currentPage === 1;
  document.getElementById("nextBtn").disabled = currentPage === getTotalPages();
  document.getElementById("firstBtn").disabled = currentPage === 1;
  document.getElementById("lastBtn").disabled = currentPage === getTotalPages();
}

function handleEnter(event) {
  if (event.key === "Enter") {
    searchBooks();
  }
}

function searchBooks() {
  const searchOption = document.getElementById("search-option").value;
  const searchInput = document
    .getElementById("search-input")
    .value.trim()
    .toLowerCase();

  let url;

  // If search input is empty, fetch all books
  if (!searchInput) {
    url = "http://localhost:4000/books"; // Get all books if no search input
  } else {
    // Construct the API URL based on the search option
    if (searchOption === "title") {
      url = `http://localhost:4000/books/search?title=${searchInput}`; // Search for title
    } else if (searchOption === "author") {
      url = `http://localhost:4000/books/search?author=${searchInput}`; // Search for author
    } else if (searchOption === "id") {
      url = `http://localhost:4000/books/${searchInput}`; // Search by ID
    }
  }

  // Fetch the data from the API
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // If no books are found, show "No Results"
      if (!data || (Array.isArray(data) && data.length === 0)) {
        displayNoResults();
      } else {
        booksData = Array.isArray(data) ? data : [data]; // Ensure array
        sortedBooksData = [...booksData]; // Prepare for sorting
        currentPage = 1; // Reset to page 1
        displayBooks();
        updatePageInfo();
      }
    })
    .catch((error) => {
      console.error("Error fetching book data from API:", error);
      displayNoResults(); // Show "No results" if an error occurs
    });
}

// Display a "No Results Found" message
function displayNoResults() {
  const bookContainer = document.getElementById("book-container");
  bookContainer.innerHTML = `
    <div class="no-results">
      <p>Nothing matches your search :(</p>
      <div class="noResults-img"> </div>
    </div>
  `;
}






function nextPage() {
  if (currentPage < getTotalPages()) {
    currentPage++;
    displayBooks();
    updatePageInfo();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    displayBooks();
    updatePageInfo();
  }
}

function goToFirstPage() {
  currentPage = 1;
  displayBooks();
  updatePageInfo();
}

function goToLastPage() {
  currentPage = getTotalPages();
  displayBooks();
  updatePageInfo();
}

function sortBooks() {
  const sortBy = document.getElementById("sort").value;

  if (sortBy === "default") {
    sortedBooksData = [...booksData];
  } else {
    sortedBooksData.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1;
      if (a[sortBy] > b[sortBy]) return 1;
      return 0;
    });
  }
  currentPage = 1;
  displayBooks();
  updatePageInfo();
}

function getTotalPages() {
  return Math.ceil(sortedBooksData.length / booksPerPage);
}

function updatePageInfo() {
  const pageInfo = document.getElementById("pageInfo");
  pageInfo.textContent = `Page ${currentPage} of ${getTotalPages()}`;
}
