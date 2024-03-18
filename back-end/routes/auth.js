const express = require("express");
const router = express.Router();
const User = require("../models/User");
const fs = require("fs");
const { google } = require("googleapis");
//const apikeys = require("../apikey.json");
const multer = require("multer");
const { MongoClient } = require("mongodb");
const app = express();
require('dotenv').config();

const mongoose = require("mongoose");

const SCOPE = ["https://www.googleapis.com/auth/drive"];
async function authorize() {
  const jwtClient = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.PRIVATE_KEY,
    SCOPE
  );
  
  await jwtClient.authorize();
  return jwtClient;
}

// Define storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Destination folder for storing uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

// Create multer instance
const upload = multer({ storage: storage });

// Function to generate a unique code
function generateUniqueCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// POST route to handle user registration (unchanged)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, gender } = req.body;
    const uniqueCode = generateUniqueCode(); // Implement this function to generate a unique code
    const user = new User({ name, email, password, role, gender, uniqueCode });
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// POST route to handle user login (unchanged)
router.post("/login", async (req, res) => {
  try {
    const { email, password, uniqueCode } = req.body;
    const user = await User.findOne({ email, password, uniqueCode });
    if (!user) throw new Error("Invalid credentials");
    res.send(user);
  } catch (error) {
    res.status(401).send(error.message);
  }
});

router.post("/upload", upload.single("uploadedFile"), async (req, res) => {
  try {
    const { userId, filename } = req.body;

    if (!userId || !filename || !req.file) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Ensure the file is stored in a temporary location
    const filePath = req.file.path;
    if (!filePath) {
      return res
        .status(500)
        .json({ message: "File upload failed: File path not found" });
    }

    const drive = google.drive({ version: "v3", auth: await authorize() });

    const uploadedFile = await drive.files.create({
      requestBody: {
        name: filename,
        parents: ["1RcObhTk7NB-5EraAJ3jqVj1h8mZLAUBv"],
      },
      media: {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(filePath),
      },
    });

    user.uploadedFiles.push({ filename });
    await user.save();

    fs.unlinkSync(filePath);

    res.status(200).json({ message: "File uploaded successfully" });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET route to fetch uploaded files for a specific user
router.get("/uploadedFiles/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Assuming uploadedFiles is an array of objects with fileName and filePath properties
    const uploadedFiles = user.uploadedFiles;
    res.status(200).json({ files: uploadedFiles });
  } catch (error) {
    console.error("Error fetching uploaded files:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

async function getFileFromDrive(filename) {
  try {
    const drive = google.drive({ version: "v3", auth: await authorize() });
    if(!drive){
      console.log("Could not authorize");
    }
    // Search for the file by name
    const response = await drive.files.list({
      q: `name='${filename}'`,
      fields: "files(id,name, mimeType)",
    });

    // Check if the file exists
    if (response.data.files.length === 0) {
      throw new Error("File not found");
    }

    // Get the file ID
    const fileId = response.data.files[0].id;
    // console.log(response);
    // Download the file content
    const fileContent = await drive.files.get(
      { fileId: fileId, alt: "media" },
      { responseType: "stream" }
    );

    // Return the file content
    return fileContent.data;
  } catch (error) {
    console.error("Error fetching file from Google Drive:", error);
    throw error;
  }
}

router.post("/download", async (req, res) => {
  const { filename } = req.body;

  try {
    // Fetch file content from Google Drive
    const fileStream = await getFileFromDrive(filename);

    // Set the appropriate content type based on the file type
    res.setHeader("Content-Type", "application/octet-stream");
    // Set the file name in the Content-Disposition header
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Pipe the file stream to the response stream
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to handle file deletion
router.delete('/delete/:filename', async (req, res) => {
  const filename = req.params.filename;

  try {
    const drive = google.drive({ version: "v3", auth: await authorize() });

    // Search for the file by name
    const response = await drive.files.list({
      q: `name='${filename}'`,
      fields: "files(id,name, mimeType)",
    });

    // Check if the file exists
    if (response.data.files.length === 0) {
      throw new Error("File not found");
    }

    // Get the file ID
    const fileId = response.data.files[0].id;

    // Delete file from Google Drive
    const driveResponse = await drive.files.delete({ fileId });
    console.log('File deleted from Google Drive:', driveResponse.status);

    // Delete file entry from MongoDB
    await User.updateOne(
      { "uploadedFiles.filename": filename }, // Match the filename in the nested array
      { $pull: { uploadedFiles: { filename } } } // Pull the matched element from the array
    );
    console.log('File entry deleted from MongoDB');

    res.status(200).send('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).send('Error deleting file');
  }
});

module.exports = router;
