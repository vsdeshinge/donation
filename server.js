const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const { MongoClient } = require("mongodb");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 3000;

// MongoDB Connection URI and Database Name
const MONGODB_URI = "mongodb+srv://shakthi:shakthi@shakthi.xuq11g4.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "shakthi";
const COLLECTION_NAME = "formData";
const COLLECTION_NAME2 = "rfq";

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Ensure `/data` directory exists for storing files
const uploadDir = path.join(__dirname, "data2");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// ✅ Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save files to `/data` directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // Limit to 100MB per file
    fileFilter: function (req, file, cb) {
        const allowedFormats = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (allowedFormats.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF, DOCX, XLSX, and CSV files are allowed"));
        }
    }
}).single("specSheet");

// Load Product Categories Data
const categoriesData = JSON.parse(fs.readFileSync("data/products.json", "utf-8"));

// MongoDB Client
let db;
MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log("✅ Connected to MongoDB");
    db = client.db(DATABASE_NAME);
  })
  .catch(err => {
    console.error("❌ Failed to connect to MongoDB", err);
  });

// ✅ Endpoint to Fetch All Categories
app.get("/api/categories", (req, res) => {
  res.json(categoriesData.map(category => ({ name: category.name }))); // Send only category names
});

// ✅ Endpoint to Fetch Products by Category
app.get("/api/products", (req, res) => {
  const { category } = req.query;
  const categoryData = categoriesData.find(c => c.name === category);

  if (categoryData && categoryData.products) {
    res.json(categoryData.products);
  } else {
    res.status(404).send("Category not found or no products available");
  }
});

// ✅ Endpoint to Fetch Submissions
app.get("/api/submissions", async (req, res) => {
  try {
    const collection = db.collection(COLLECTION_NAME);
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    res.status(500).send("Error retrieving data");
  }
});

// ✅ Endpoint to Handle Form Submission
app.post("/api/submit", async (req, res) => {
  try {
    const formData = req.body;
    console.log("📩 Form Data Received:", formData);

    // Insert data into MongoDB
    const collection = db.collection(COLLECTION_NAME);
    const result = await collection.insertOne(formData);

    console.log("✅ Data saved to MongoDB:", result.insertedId);
    res.status(200).send("Form submitted successfully");
  } catch (error) {
    console.error("❌ Error saving data to MongoDB:", error);
    res.status(500).send("Failed to submit form");
  }
});

// ✅ Admin Credentials
const ADMIN_CREDENTIALS = {
  username: "a",
  password: "a"
};

// ✅ API Route for Admin Login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    res.status(200).json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});

// ✅ Serve Admin Dashboard (admin.html)
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// ✅ API Route to Handle RFQ Form & File Upload
app.post("/api/submitRFQ", upload, async (req, res) => {
  try {
      console.log("📩 Received RFQ Data:", req.body);
      
      const formData = req.body; // ✅ No need for JSON.parse

      if (req.file) {
          formData.specSheetPath = `/data/${req.file.filename}`; // ✅ Correct file path storage
      }

      const collection = db.collection(COLLECTION_NAME2);
      const result = await collection.insertOne(formData);
      
      console.log("✅ RFQ Data Saved:", result.insertedId);
      res.status(200).json({ message: "RFQ submitted successfully", file: req.file ? req.file.filename : null });
  } catch (error) {
      console.error("❌ Error saving RFQ:", error);
      res.status(500).json({ message: "Failed to submit RFQ" });
  }
});

// ✅ Serve RFQ Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "rfq.html"));
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
