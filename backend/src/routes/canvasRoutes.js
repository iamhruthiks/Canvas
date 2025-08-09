const express = require("express");
const router = express.Router();
const canvasController = require("../controllers/canvasController");
const upload = require("../middlewares/uploadMiddleware");

// Testing
router.get("/", (req, res) => {
  res.json({ msg: "canvas endpoints have been hit" });
});

// Get all canvases
router.get("/all", canvasController.getAllCanvases);

// Get a single canvas by ID
router.get("/:canvasId", canvasController.getCanvasById);

// Initialize a new canvas
router.post("/init", canvasController.initCanvas);

// Add a shape
router.post("/add/shape", canvasController.addShape);

// Update erased points
router.post("/erase-points", canvasController.erasePoints);

// Add text
router.post("/add/text", canvasController.addText);

// Add image by URL
router.post("/add/image-url", canvasController.addImageByUrl);

// Add image by upload
router.post(
  "/add/image-upload",
  upload.single("image"),
  canvasController.addImageByUpload
);

// Export canvas as PDF
router.get("/export/:canvasId", canvasController.exportCanvasAsPdf);

// Delete a canvas by ID
router.delete("/delete/:canvasId", canvasController.deleteCanvas);

module.exports = router;
