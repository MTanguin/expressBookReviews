const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is valid (not already in use)
const isValid = (username) => { //returns boolean
  // username is valid if it does NOT already exist in users[]
  let existingUser = users.find((user) => user.username === username);
  return existingUser ? false : true;
};

// Check if username and password match a registered user
const authenticatedUser = (username, password) => { //returns boolean
  let validUser = users.find(
    (user) => user.username === username && user.password === password
  );
  return validUser ? true : false;
};

// Task 7 - only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Both username and password must be provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check credentials
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login. Check username and password" });
  }

  // Create JWT token (secret must match index.js)
  let accessToken = jwt.sign(
    { data: username },  // payload
    "access",            // secret key
    { expiresIn: 60 * 60 } // 1 hour
  );

  // Save in session so middleware in index.js can use it
  req.session.authorization = { accessToken, username };
  req.session.username = username;

  return res.status(200).json({ message: "User successfully logged in" });
});

// Task 8 - Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session && req.session.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required in query parameter 'review'" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Ensure reviews object exists
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update review for this user
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added or modified successfully",
    reviews: books[isbn].reviews
  });
});

// Task 9 - Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session && req.session.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const reviews = books[isbn].reviews;

  if (reviews && reviews[username]) {
    delete reviews[username];
    return res.status(200).json({
      message: "Review deleted successfully",
      reviews: reviews
    });
  } else {
    return res.status(404).json({ message: "No review by this user for this book" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;


