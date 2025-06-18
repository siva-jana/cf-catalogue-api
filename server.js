// Import necessary modules
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require('path');
const db = require("./app/models");
require('dotenv').config();
const multer = require('multer');

// Create an instance of Express app
const app = express();

// Set the port (default is 8080)
const PORT = process.env.PORT || 8080;

// CORS options (optional: restrict origin if needed)
const corsOptions = {
  origin: "http://localhost:4200" // Example: Angular frontend
};

// Use CORS
app.use(cors(corsOptions));

// Parse requests of content-type: application/json
app.use(express.json());

// Parse requests of content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));



// Simple root route for testing
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application!" });
});

// Import routes for user authentication
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);


// Function to seed initial roles into the roles collection
async function initial() {
  const Role = db.role;

  try {
    const count = await Role.estimatedDocumentCount(); // No callback, returns a promise

    if (count === 0) {
      await new Role({ name: "user" }).save();
      console.log("added 'user' to roles collection");

      await new Role({ name: "moderator" }).save();
      console.log("added 'moderator' to roles collection");

      await new Role({ name: "admin" }).save();
      console.log("added 'admin' to roles collection");
    }
  } catch (err) {
    console.error("Role seeding error:", err);
  }
}

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initial database connection for seeding roles
db.mongoose
  .connect("mongodb://127.0.0.1:27017/catalogue_db")
  .then(() => {
    console.log("Successfully connected to MongoDB.");
    initial(); // Seed roles
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });




  // Serve static files from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route to get list of files for a category
const fs = require('fs');

app.get('/api/files/:category', (req, res) => {
  const category = req.params.category;
  const categoryPath = path.join(__dirname, 'uploads', category);

  // Check if folder exists
  if (!fs.existsSync(categoryPath)) {
    return res.status(404).json({ message: 'Category not found' });
  }

  // Read files from the folder
  fs.readdir(categoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Unable to read files' });
    }

    // Return an array of objects with file name and URL
    const result = files.map(file => ({
      name: file,
      url: `http://localhost:${PORT}/uploads/${category}/${file}`
    }));

    res.json(result);
  });
});
app.get('/download/:category/:filename', (req, res) => {
  const { category, filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', category, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  // Set headers and trigger download
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Download error:', err);
      res.status(500).send('Error downloading file');
    }
  });
});
const mammoth = require('mammoth');

app.get('/api/docx/:category/:filename', (req, res) => {
  const { category, filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', category, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) return res.status(500).send('Error reading file');

    mammoth.convertToHtml({ buffer: data })
      .then(result => {
        res.send(result.value);  // Send HTML string to frontend
      })
      .catch(err => {
        console.error('Mammoth error:', err);
        res.status(500).send('Error processing docx file');
      });
  });
});
