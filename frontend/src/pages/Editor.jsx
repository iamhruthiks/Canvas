import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const Editor = () => {
  const { canvasId } = useParams();
  const [canvasData, setCanvasData] = useState(null);
  const [selectedTool, setSelectedTool] = useState("pencil");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);

  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // Drawing state
  const isDrawing = useRef(false);
  const currentPath = useRef([]);

  // Fetch canvas data from backend
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
  }, [canvasId, API_BASE_URL]);

  // Setup canvas and redraw existing elements when canvasData changes
  useEffect(() => {
    if (!canvasData) return;

    const canvas = canvasRef.current;
    canvas.width = canvasData.width;
    canvas.height = canvasData.height;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw saved elements (only "path" for now)
    if (canvasData.elements && canvasData.elements.length > 0) {
      canvasData.elements.forEach((element) => {
        if (element.type === "path") {
          drawPath(ctx, element.props);
        }
        // TODO: Add drawing for other types later (rectangle, circle, etc.)
      });
    }
  }, [canvasData]);

  // Function to draw a path (stroke) on canvas context
  function drawPath(ctx, props) {
    const { points, color = "#000", brushSize = 5 } = props;
    if (!points || points.length === 0) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  // Pointer event handlers for drawing
  const handlePointerDown = (e) => {
    if (selectedTool !== "pencil") return;

    isDrawing.current = true;
    const { offsetX, offsetY } = e.nativeEvent;

    currentPath.current = [{ x: offsetX, y: offsetY }];

    const ctx = ctxRef.current;
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current || selectedTool !== "pencil") return;

    const { offsetX, offsetY } = e.nativeEvent;

    currentPath.current.push({ x: offsetX, y: offsetY });

    const ctx = ctxRef.current;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const handlePointerUp = async () => {
    if (!isDrawing.current || selectedTool !== "pencil") return;

    isDrawing.current = false;

    try {
      // Send the completed path to backend to save
      await axios.post(`${API_BASE_URL}/api/v1/canvas/add/shape`, {
        canvasId,
        type: "path",
        props: {
          points: currentPath.current,
          color,
          brushSize,
        },
      });

      // Update canvasData locally by fetching again to reflect new element
      const res = await axios.get(`${API_BASE_URL}/api/v1/canvas/${canvasId}`);
      setCanvasData(res.data);

      currentPath.current = [];
    } catch (error) {
      console.error("Failed to save path:", error);
    }
  };

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
          ref={canvasRef}
          id="canvas"
          className="canvas-element"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ border: "1px solid #ccc", touchAction: "none" }}
        />
      </div>
    </div>
  );
};

export default Editor;
