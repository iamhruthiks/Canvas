const Canvas = require("../models/canvasModel");

// Initialize a new canvas
exports.initCanvas = async (req, res) => {
  try {
    const { width, height } = req.body;

    if (!width || !height) {
      return res.status(400).json({ error: "Width and height are required" });
    }

    const newCanvas = new Canvas({
      width,
      height,
      elements: [],
    });

    await newCanvas.save();

    res.status(201).json({
      message: "Canvas created successfully",
      canvasId: newCanvas._id,
    });
  } catch (err) {
    console.error("Error creating canvas:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Add a shape
exports.addShape = (req, res) => {
  res.status(501).json({ error: "add shape not implemented yet" });
};

// Add text
exports.addText = (req, res) => {
  res.status(501).json({ error: "add text not implemented yet" });
};

// Add image by URL
exports.addImageByUrl = (req, res) => {
  res.status(501).json({ error: "add image-url not implemented yet" });
};

// Add image by upload
exports.addImageByUpload = (req, res) => {
  res.status(501).json({ error: "add image-upload not implemented yet" });
};

// Export canvas as PDF
exports.exportCanvasAsPdf = (req, res) => {
  res.status(501).json({ error: "export not implemented yet" });
};
