const Canvas = require("../models/canvasModel");
const cloudinary = require("../config/cloudinaryConfig");
const PDFDocument = require("pdfkit");
const axios = require("axios");
const mongoose = require("mongoose");

// Get all canvases
exports.getAllCanvases = async (req, res) => {
  try {
    const canvases = await Canvas.find().sort({ createdAt: -1 });
    res.status(200).json(canvases);
  } catch (err) {
    console.error("Error fetching canvases:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Initialize a new canvas
exports.initCanvas = async (req, res) => {
  try {
    const { name, width, height } = req.body;

    if (!name || !width || !height) {
      return res
        .status(400)
        .json({ error: "Name , width and height are required" });
    }

    const newCanvas = new Canvas({
      name,
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

// Get a single canvas by ID
exports.getCanvasById = async (req, res) => {
  try {
    const { canvasId } = req.params;
    const canvas = await Canvas.findById(canvasId);

    if (!canvas) {
      return res.status(404).json({ error: "Canvas not found" });
    }

    res.status(200).json(canvas);
  } catch (err) {
    console.error("Error fetching canvas:", err);
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

    if (!["rectangle", "circle", "path"].includes(type)) {
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

// Update erased points
exports.erasePoints = async (req, res) => {
  try {
    const { canvasId, erasedPoints, eraserSize = 10 } = req.body;

    if (!canvasId || !erasedPoints || !Array.isArray(erasedPoints)) {
      return res
        .status(400)
        .json({ error: "canvasId and erasedPoints are required" });
    }

    const canvas = await Canvas.findById(canvasId);
    if (!canvas) {
      return res.status(404).json({ error: "Canvas not found" });
    }

    const tolerance = eraserSize;

    canvas.elements = canvas.elements
      .map((element) => {
        if (element.type === "path" && element.props.points) {
          // Partially erase points near erasedPoints
          const filteredPoints = element.props.points.filter((p) => {
            return !erasedPoints.some((ep) => {
              const dx = ep.x - p.x;
              const dy = ep.y - p.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              return dist <= tolerance;
            });
          });
          return {
            ...element,
            props: {
              ...element.props,
              points: filteredPoints,
            },
          };
        } else if (element.type === "rectangle") {
          const { x, y, width, height } = element.props;
          const isErased = erasedPoints.some((ep) => {
            return (
              ep.x >= x - tolerance &&
              ep.x <= x + width + tolerance &&
              ep.y >= y - tolerance &&
              ep.y <= y + height + tolerance
            );
          });
          if (isErased) {
            return null;
          }
          return element;
        } else if (element.type === "circle") {
          const { x, y, radius } = element.props;
          const r = radius || 10;
          const isErased = erasedPoints.some((ep) => {
            const dx = ep.x - x;
            const dy = ep.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return dist <= r + tolerance;
          });
          if (isErased) {
            return null;
          }
          return element;
        } else if (element.type === "text") {
          const { x, y, fontSize = 20, text = "" } = element.props;
          // Approximate bounding box for text
          const approxWidth = text.length * fontSize * 0.6;
          const approxHeight = fontSize;

          const isErased = erasedPoints.some((ep) => {
            return (
              ep.x >= x - tolerance &&
              ep.x <= x + approxWidth + tolerance &&
              ep.y >= y - tolerance &&
              ep.y <= y + approxHeight + tolerance
            );
          });

          if (isErased) {
            return null;
          }
          return element;
        }
        return element;
      })
      .filter(
        (el) =>
          el !== null && !(el.type === "path" && el.props.points.length === 0)
      );

    await canvas.save();

    res.status(200).json({ message: "Points erased successfully", canvas });
  } catch (error) {
    console.error("Error erasing points:", error);
    res.status(500).json({ error: "Server error erasing points" });
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

// Update image props
exports.updateImageProps = async (req, res) => {
  try {
    const { canvasId, elementId, props } = req.body;

    if (!canvasId || !elementId || !props) {
      return res
        .status(400)
        .json({ error: "canvasId, elementId, and props are required" });
    }

    const canvas = await Canvas.findById(canvasId);
    if (!canvas) {
      return res.status(404).json({ error: "Canvas not found" });
    }

    // Find the element by _id (elementId)
    const element = canvas.elements.id(elementId);
    if (!element) {
      return res.status(404).json({ error: "Element not found" });
    }

    if (element.type !== "image") {
      return res.status(400).json({ error: "Element is not an image" });
    }

    // Update the element's props with new props (x, y, width, height etc)
    element.props = { ...element.props, ...props };

    await canvas.save();

    return res
      .status(200)
      .json({ message: "Image updated successfully", canvas });
  } catch (err) {
    console.error("Error updating image props:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Export canvas as PDF
exports.exportCanvasAsPdf = async (req, res) => {
  try {
    const { canvasId } = req.params;
    const canvas = await Canvas.findById(canvasId);
    if (!canvas) {
      return res.status(404).json({ error: "Canvas not found" });
    }

    const doc = new PDFDocument({
      size: [canvas.width, canvas.height],
      margin: 0,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=canvas_${canvasId}.pdf`
    );

    doc.pipe(res);

    for (const element of canvas.elements) {
      const { type, props } = element;

      if (type === "path") {
        if (!props.points || props.points.length < 2) continue;
        doc
          .moveTo(props.points[0].x, props.points[0].y)
          .lineWidth(props.brushSize || 1)
          .strokeColor(props.color || "black");

        for (let i = 1; i < props.points.length; i++) {
          doc.lineTo(props.points[i].x, props.points[i].y);
        }
        doc.stroke();
      } else if (type === "rectangle") {
        doc
          .rect(props.x, props.y, props.width, props.height)
          .lineWidth(props.brushSize || 1)
          .strokeColor(props.color || "black")
          .stroke();
      } else if (type === "circle") {
        doc
          .circle(props.x, props.y, props.radius || 0)
          .lineWidth(props.brushSize || 1)
          .strokeColor(props.color || "black")
          .stroke();
      } else if (type === "text") {
        doc
          .fillColor(props.color || "black")
          .fontSize(props.fontSize || 12)
          .text(props.text || "", props.x, props.y);
      } else if (type === "image") {
        if (props.url) {
          try {
            const response = await axios.get(props.url, {
              responseType: "arraybuffer",
            });
            const imgBuffer = Buffer.from(response.data, "binary");
            doc.image(imgBuffer, props.x, props.y, {
              width: props.width,
              height: props.height,
            });
          } catch (error) {
            console.error("Error loading image for PDF:", error);
          }
        }
      }
    }

    doc.end();
  } catch (error) {
    console.error("Error exporting PDF:", error);
    res.status(500).json({ error: "Failed to export PDF" });
  }
};

// Delete a canvas by ID
exports.deleteCanvas = async (req, res) => {
  try {
    const { canvasId } = req.params;

    const canvas = await Canvas.findByIdAndDelete(canvasId);

    if (!canvas) {
      return res.status(404).json({ error: "Canvas not found" });
    }

    res.status(200).json({ message: "Canvas deleted successfully" });
  } catch (error) {
    console.error("Error deleting canvas:", error);
    res.status(500).json({ error: "Failed to delete canvas" });
  }
};
