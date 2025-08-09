const Canvas = require("../models/canvasModel");
const cloudinary = require("../config/cloudinaryConfig");

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
exports.addShape = async (req, res) => {
  try {
    const { canvasId, type, props } = req.body;

    if (!canvasId || !type || !props) {
      return res
        .status(400)
        .json({ error: "canvasId, type, and props are required" });
    }

    if (!["rectangle", "circle"].includes(type)) {
      return res.status(400).json({ error: "Invalid shape type" });
    }

    const canvas = await Canvas.findById(canvasId);
    if (!canvas) {
      return res.status(404).json({ error: "Canvas not found" });
    }

    canvas.elements.push({ type, props });
    await canvas.save();

    res.status(200).json({ message: "Shape added successfully", canvas });
  } catch (err) {
    console.error("Error adding shape:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Add text
exports.addText = async (req, res) => {
  try {
    const { canvasId, type, props } = req.body;

    if (!canvasId || !type || !props) {
      return res
        .status(400)
        .json({ error: "canvasId, type, and props are required" });
    }

    if (type !== "text") {
      return res.status(400).json({ error: "Invalid type for text element" });
    }

    const canvas = await Canvas.findById(canvasId);
    if (!canvas) {
      return res.status(404).json({ error: "Canvas not found" });
    }

    canvas.elements.push({ type, props });
    await canvas.save();

    res.status(200).json({ message: "Text added successfully", canvas });
  } catch (err) {
    console.error("Error adding text:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Add image by URL
exports.addImageByUrl = async (req, res) => {
  try {
    const { canvasId, type, props } = req.body;

    if (!canvasId || !type || !props || !props.url) {
      return res
        .status(400)
        .json({ error: "canvasId, type, and props with url are required" });
    }

    if (type !== "image") {
      return res.status(400).json({ error: "Invalid type for image element" });
    }

    const canvas = await Canvas.findById(canvasId);
    if (!canvas) {
      return res.status(404).json({ error: "Canvas not found" });
    }

    canvas.elements.push({ type, props });
    await canvas.save();

    res.status(200).json({ message: "Image added successfully", canvas });
  } catch (err) {
    console.error("Error adding image by URL:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Add image by upload
exports.addImageByUpload = async (req, res) => {
  try {
    const { canvasId, type, props } = req.body;

    if (!canvasId || type !== "image") {
      return res
        .status(400)
        .json({ error: "canvasId and type=image are required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    let parsedProps = props;
    if (typeof props === "string") {
      try {
        parsedProps = JSON.parse(props);
      } catch (error) {
        return res.status(400).json({ error: "Invalid JSON in props" });
      }
    }

    const canvas = await Canvas.findById(canvasId);
    if (!canvas) {
      return res.status(404).json({ error: "Canvas not found" });
    }

    const uploadFromBuffer = (buffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "canvas-builder" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

    const result = await uploadFromBuffer(req.file.buffer);

    canvas.elements.push({
      type,
      props: {
        ...parsedProps,
        url: result.secure_url,
      },
    });

    await canvas.save();

    return res
      .status(200)
      .json({ message: "Image uploaded successfully", canvas });
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Export canvas as PDF
exports.exportCanvasAsPdf = (req, res) => {
  res.status(501).json({ error: "export not implemented yet" });
};
