const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const categoriesData = JSON.parse(fs.readFileSync("data/products.json", "utf-8"));

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

// Endpoint to handle form submission
app.post("/api/submit", (req, res) => {
  console.log("Form Data Received:", req.body);
  res.status(200).send("Form submitted successfully");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
