const express = require("express");
const router = express.Router();

// Testing
router.get("/", (req, res) => {
  res.json({ msg: "canvas endpoints have been hit" });
});

// Initialize a new canvas
router.post("/init", (req, res) => {
  res.status(501).json({ error: "init not implemented yet" });
});

// Add a shape
router.post("/add/shape", (req, res) => {
  res.status(501).json({ error: "add shape not implemented yet" });
});

// Add text
router.post("/add/text", (req, res) => {
  res.status(501).json({ error: "add text not implemented yet" });
});

// Add image by URL
router.post("/add/image-url", (req, res) => {
  res.status(501).json({ error: "add image-url not implemented yet" });
});

// Add image by upload
router.post("/add/image-upload", (req, res) => {
  res.status(501).json({ error: "add image-upload not implemented yet" });
});

// Export canvas as PDF
router.get("/export/:canvasId", (req, res) => {
  res.status(501).json({ error: "export not implemented yet" });
});

module.exports = router;
