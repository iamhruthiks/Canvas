const mongoose = require("mongoose");

const elementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["rectangle", "circle", "text", "image"],
    required: true,
  },
  props: {
    type: Object,
    required: true,
  },
});

const canvasSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    elements: [elementSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Canvas", canvasSchema);
