const express = require("express");
const cors = require("cors");
const canvasRoutes = require("./src/routes/canvasRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("backend in running");
});

// Canvas API routes
app.use("/api/v1/canvas", canvasRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
