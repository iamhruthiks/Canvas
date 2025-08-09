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

  // Pencil drawing
  const isDrawing = useRef(false);
  const currentPath = useRef([]);

  // Eraser
  const isErasing = useRef(false);
  const erasedPoints = useRef([]);

  // Rectangle drawing
  const isDrawingRect = useRef(false);
  const rectStart = useRef({ x: 0, y: 0 });
  const rectCurrent = useRef({ x: 0, y: 0 });

  // Circle drawing
  const isDrawingCircle = useRef(false);
  const circleStart = useRef({ x: 0, y: 0 });
  const circleCurrent = useRef({ x: 0, y: 0 });

  // Fetch canvas data
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

  // Setup canvas and redraw elements
  useEffect(() => {
    if (!canvasData) return;

    const canvas = canvasRef.current;
    canvas.width = canvasData.width;
    canvas.height = canvasData.height;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvasData.elements.forEach((element) => {
      if (element.type === "path") {
        drawPath(ctx, element.props);
      } else if (element.type === "rectangle") {
        drawRectangle(ctx, element.props);
      } else if (element.type === "circle") {
        drawCircle(ctx, element.props);
      } else if (element.type === "text") {
        drawText(ctx, element.props);
      }
    });
  }, [canvasData]);

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

  function drawRectangle(ctx, props) {
    const { x, y, width, height, color = "#000", brushSize = 1 } = props;
    if (width === 0 || height === 0) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.strokeRect(x, y, width, height);
  }

  function drawCircle(ctx, props) {
    const { x, y, radius = 0, color = "#000", brushSize = 1 } = props;
    if (radius === 0) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }

  function drawText(ctx, props) {
    const { x, y, text = "", color = "#000", fontSize = 20 } = props;
    if (!text) return;

    ctx.fillStyle = color;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textBaseline = "top";
    ctx.fillText(text, x, y);
  }

  // Pointer handlers
  const handlePointerDown = async (e) => {
    const { offsetX, offsetY } = e.nativeEvent;

    if (selectedTool === "pencil") {
      isDrawing.current = true;
      currentPath.current = [{ x: offsetX, y: offsetY }];

      const ctx = ctxRef.current;
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
    } else if (selectedTool === "eraser") {
      isErasing.current = true;
      erasedPoints.current = [{ x: offsetX, y: offsetY }];

      const ctx = ctxRef.current;
      ctx.clearRect(
        offsetX - brushSize / 2,
        offsetY - brushSize / 2,
        brushSize,
        brushSize
      );
    } else if (selectedTool === "rectangle") {
      isDrawingRect.current = true;
      rectStart.current = { x: offsetX, y: offsetY };
      rectCurrent.current = { x: offsetX, y: offsetY };
    } else if (selectedTool === "circle") {
      isDrawingCircle.current = true;
      circleStart.current = { x: offsetX, y: offsetY };
      circleCurrent.current = { x: offsetX, y: offsetY };
    } else if (selectedTool === "text") {
      // Prompt user to enter text on click position
      const userText = prompt("Enter text:");
      if (userText && userText.trim() !== "") {
        // Save text shape to backend
        try {
          await axios.post(`${API_BASE_URL}/api/v1/canvas/add/text`, {
            canvasId,
            type: "text",
            props: {
              x: offsetX,
              y: offsetY,
              text: userText.trim(),
              color,
              fontSize: brushSize,
            },
          });
          // Refresh canvas data after adding text
          const res = await axios.get(
            `${API_BASE_URL}/api/v1/canvas/${canvasId}`
          );
          setCanvasData(res.data);
        } catch (error) {
          console.error("Failed to save text:", error);
          alert("Failed to save text. Please try again.");
        }
      }
    }
  };

  const handlePointerMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = ctxRef.current;

    if (isDrawing.current && selectedTool === "pencil") {
      currentPath.current.push({ x: offsetX, y: offsetY });
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    } else if (isErasing.current && selectedTool === "eraser") {
      erasedPoints.current.push({ x: offsetX, y: offsetY });
      ctx.clearRect(
        offsetX - brushSize / 2,
        offsetY - brushSize / 2,
        brushSize,
        brushSize
      );
    } else if (isDrawingRect.current && selectedTool === "rectangle") {
      rectCurrent.current = { x: offsetX, y: offsetY };

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      canvasData.elements.forEach((element) => {
        if (element.type === "path") {
          drawPath(ctx, element.props);
        } else if (element.type === "rectangle") {
          drawRectangle(ctx, element.props);
        } else if (element.type === "circle") {
          drawCircle(ctx, element.props);
        } else if (element.type === "text") {
          drawText(ctx, element.props);
        }
      });

      const startX = rectStart.current.x;
      const startY = rectStart.current.y;
      const width = offsetX - startX;
      const height = offsetY - startY;

      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.strokeRect(startX, startY, width, height);
    } else if (isDrawingCircle.current && selectedTool === "circle") {
      circleCurrent.current = { x: offsetX, y: offsetY };

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      canvasData.elements.forEach((element) => {
        if (element.type === "path") {
          drawPath(ctx, element.props);
        } else if (element.type === "rectangle") {
          drawRectangle(ctx, element.props);
        } else if (element.type === "circle") {
          drawCircle(ctx, element.props);
        } else if (element.type === "text") {
          drawText(ctx, element.props);
        }
      });

      const startX = circleStart.current.x;
      const startY = circleStart.current.y;

      const dx = offsetX - startX;
      const dy = offsetY - startY;
      const radius = Math.sqrt(dx * dx + dy * dy);

      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const handlePointerUp = async () => {
    if (isDrawing.current && selectedTool === "pencil") {
      isDrawing.current = false;
      try {
        await axios.post(`${API_BASE_URL}/api/v1/canvas/add/shape`, {
          canvasId,
          type: "path",
          props: {
            points: currentPath.current,
            color,
            brushSize,
          },
        });
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/canvas/${canvasId}`
        );
        setCanvasData(res.data);
        currentPath.current = [];
      } catch (error) {
        console.error("Failed to save path:", error);
      }
    } else if (isErasing.current && selectedTool === "eraser") {
      isErasing.current = false;
      try {
        await axios.post(`${API_BASE_URL}/api/v1/canvas/erase-points`, {
          canvasId,
          erasedPoints: erasedPoints.current,
          eraserSize: brushSize,
        });
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/canvas/${canvasId}`
        );
        setCanvasData(res.data);
        erasedPoints.current = [];
      } catch (error) {
        console.error("Failed to erase points:", error);
      }
    } else if (isDrawingRect.current && selectedTool === "rectangle") {
      isDrawingRect.current = false;

      const startX = rectStart.current.x;
      const startY = rectStart.current.y;
      const endX = rectCurrent.current.x;
      const endY = rectCurrent.current.y;

      const x = Math.min(startX, endX);
      const y = Math.min(startY, endY);
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);

      try {
        await axios.post(`${API_BASE_URL}/api/v1/canvas/add/shape`, {
          canvasId,
          type: "rectangle",
          props: {
            x,
            y,
            width,
            height,
            color,
            brushSize,
          },
        });

        const res = await axios.get(
          `${API_BASE_URL}/api/v1/canvas/${canvasId}`
        );
        setCanvasData(res.data);
      } catch (error) {
        console.error("Failed to save rectangle:", error);
      }
    } else if (isDrawingCircle.current && selectedTool === "circle") {
      isDrawingCircle.current = false;

      const startX = circleStart.current.x;
      const startY = circleStart.current.y;
      const endX = circleCurrent.current.x;
      const endY = circleCurrent.current.y;

      const dx = endX - startX;
      const dy = endY - startY;
      const radius = Math.sqrt(dx * dx + dy * dy);

      try {
        await axios.post(`${API_BASE_URL}/api/v1/canvas/add/shape`, {
          canvasId,
          type: "circle",
          props: {
            x: startX,
            y: startY,
            radius,
            color,
            brushSize,
          },
        });

        const res = await axios.get(
          `${API_BASE_URL}/api/v1/canvas/${canvasId}`
        );
        setCanvasData(res.data);
      } catch (error) {
        console.error("Failed to save circle:", error);
      }
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
          disabled={selectedTool === "eraser"}
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
