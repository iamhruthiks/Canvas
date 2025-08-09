import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const Editor = () => {
  const { canvasId } = useParams();
  const [canvasData, setCanvasData] = useState(null);
  const [selectedTool, setSelectedTool] = useState("pencil");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);

  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchCanvas = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/canvas/${canvasId}`
        );
        setCanvasData(res.data);
      } catch (error) {
        console.error("Error fetching canvas:", error);
      }
    };
    fetchCanvas();
    if (canvasData) {
      console.log("Canvas dimensions:", canvasData.width, canvasData.height);
    }
  }, [canvasId]);

  return (
    <div className="editor-page">
      <div className="editor-toolbar">
        <button
          className={selectedTool === "pencil" ? "active" : ""}
          onClick={() => setSelectedTool("pencil")}
        >
          Pencil
        </button>
        <button
          className={selectedTool === "eraser" ? "active" : ""}
          onClick={() => setSelectedTool("eraser")}
        >
          Eraser
        </button>
        <button
          className={selectedTool === "rectangle" ? "active" : ""}
          onClick={() => setSelectedTool("rectangle")}
        >
          Rectangle
        </button>
        <button
          className={selectedTool === "circle" ? "active" : ""}
          onClick={() => setSelectedTool("circle")}
        >
          Circle
        </button>
        <button
          className={selectedTool === "text" ? "active" : ""}
          onClick={() => setSelectedTool("text")}
        >
          Text
        </button>
        <button
          className={selectedTool === "image" ? "active" : ""}
          onClick={() => setSelectedTool("image")}
        >
          Image
        </button>

        <input
          type="color"
          className="color-picker"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <input
          type="range"
          min="1"
          max="50"
          className="brush-size"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
        />
      </div>

      <div className="canvas-wrapper">
        <div className="canvas-info">
          <h2>{canvasData?.name || "Untitled Canvas"}</h2>
          <p>
            Dimensions: {canvasData?.width}px × {canvasData?.height}px
          </p>
        </div>
        <canvas
          id="canvas"
          width={canvasData?.width || 800}
          height={canvasData?.height || 600}
          className="canvas-element"
        />
      </div>
    </div>
  );
};

export default Editor;
