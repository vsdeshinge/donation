const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const productsData = JSON.parse(fs.readFileSync("data/products.json"));

// Endpoint to fetch categories
app.get("/api/categories", (req, res) => {
  res.json(Object.keys(productsData));
});

// Endpoint to fetch products by category
app.get("/api/products", (req, res) => {
  const { category } = req.query;
  res.json(productsData[category] || []);
});

// Endpoint to handle form submission
app.post("/api/submit", (req, res) => {
  console.log("Form Data Received:", req.body);
  res.status(200).send("Form submitted successfully");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
