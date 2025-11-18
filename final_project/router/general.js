const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Internal helper route – returns all books directly
// Used by axios in the async/await routes below
public_users.get("/booksraw", (req, res) => {
  return res.status(200).json(books);
});

// Task 10: Get all books using async/await + Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5000/booksraw");
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching book list",
      error: error.message
    });
  }
});

// Task 11: Get book details based on ISBN using async/await + Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get("http://localhost:5000/booksraw");
    const data = response.data;
    const book = data[isbn];

    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching book by ISBN",
      error: error.message
    });
  }
});

// Task 12: Get book details based on author using async/await + Axios
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const response = await axios.get("http://localhost:5000/booksraw");
    const data = response.data;
    const keys = Object.keys(data);
    let result = [];

    for (let i = 0; i < keys.length; i++) {
      const book = data[keys[i]];
      if (book.author === author) {
        result.push({ isbn: keys[i], ...book });
      }
    }

    if (result.length > 0) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ message: "Author not found" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching books by author",
      error: error.message
    });
  }
});

// Task 13: Get book details based on title using async/await + Axios
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const response = await axios.get("http://localhost:5000/booksraw");
    const data = response.data;
    const keys = Object.keys(data);
    let result = [];

    for (let i = 0; i < keys.length; i++) {
      const book = data[keys[i]];
      if (book.title === title) {
        result.push({ isbn: keys[i], ...book });
      }
    }

    if (result.length > 0) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ message: "Title not found" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching books by title",
      error: error.message
    });
  }
});

// Task 5: Get book reviews
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;



