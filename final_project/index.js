const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Enable session for /customer routes
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
  })
);

// Auth middleware for protected /customer/auth/* routes
app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if the session has an authorization object with an access token
  if (req.session.authorization) {
    let token = req.session.authorization["accessToken"];

    // Verify the JWT using the same secret that was used when signing it
    jwt.verify(token, "access", (err, user) => {
      if (err) {
        return res.status(403).json({ message: "User not authenticated" });
      }
      // Optionally store user info in the request
      req.user = user;
      next();
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

const PORT = 5000;

// 🔹 Mount customer routes here (this was missing)
app.use("/customer", customer_routes);

// Public routes
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));

