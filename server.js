const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs").promises;
const session = require("express-session");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
const PORT = 3000;

// Admin Credentials (For Now, Store in Environment Variables)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password";

// MongoDB Connection
const MONGODB_URI = "mongodb+srv://shakthi:shakthi@shakthi.xuq11g4.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "shakthi";
const COLLECTION_NAME = "formData";

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.static("admin"));

// Session Middleware for Authentication
app.use(session({
  secret: "securesecret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set `secure: true` for HTTPS environments
}));

let db;
async function connectDB() {
  try {
    const client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected to MongoDB");
    db = client.db(DATABASE_NAME);
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1);
  }
}
connectDB();

// Admin Login Endpoint
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.admin = true;
    res.status(200).send("Login successful");
  } else {
    res.status(401).send("Unauthorized");
  }
});

// Middleware to Protect Admin Routes
function checkAuth(req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.status(403).send("Forbidden");
  }
}

// Fetch All Form Data (Protected)
app.get("/api/admin/data", checkAuth, async (req, res) => {
  try {
    const collection = db.collection(COLLECTION_NAME);
    const data = await collection.find().toArray();
    console.log(data);
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    res.status(500).send("Failed to fetch data");
  }
});

// Serve the Admin Dashboard (Protected)
app.get("/admin/admin.html", checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "admin", "admin.html"));
});

// Logout Endpoint
app.post("/api/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login.html");
  });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
