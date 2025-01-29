const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;

// MongoDB Connection URI and Database Name
const MONGODB_URI = "mongodb+srv://shakthi:shakthi@shakthi.xuq11g4.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "shakthi";
const COLLECTION_NAME = "formData";

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const categoriesData = JSON.parse(fs.readFileSync("data/products.json", "utf-8"));

// MongoDB Client
let db;
MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log("Connected to MongoDB");
    db = client.db(DATABASE_NAME);
  })
  .catch(err => {
    console.error("Failed to connect to MongoDB", err);
  });

// Endpoint to fetch all categories
app.get("/api/categories", (req, res) => {
  res.json(categoriesData.map(category => ({ name: category.name }))); // Send only category names
});

// Endpoint to fetch products by category
app.get("/api/products", (req, res) => {
  const { category } = req.query;
  const categoryData = categoriesData.find(c => c.name === category);

  if (categoryData && categoryData.products) {
    res.json(categoryData.products);
  } else {
    res.status(404).send("Category not found or no products available");
  }
});

app.get("/api/submissions", async (req, res) => {
  try {
    const collection = db.collection(COLLECTION_NAME);
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error retrieving data");
  }
});


// Endpoint to handle form submission
app.post("/api/submit", async (req, res) => {
  try {
    const formData = req.body;
    console.log("Form Data Received:", formData);

    // Insert data into MongoDB
    const collection = db.collection(COLLECTION_NAME);
    const result = await collection.insertOne(formData);

    console.log("Data saved to MongoDB:", result.insertedId);
    res.status(200).send("Form submitted successfully");
  } catch (error) {
    console.error("Error saving data to MongoDB:", error);
    res.status(500).send("Failed to submit form");
  }
});



const ADMIN_CREDENTIALS = {
  username: "a",
  password: "a"
};

// API Route for Admin Login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    res.status(200).json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});

// Serve Admin Dashboard (admin.html)
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
