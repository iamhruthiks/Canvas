import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const Editor = () => {
  const { canvasId } = useParams();
  const [canvasData, setCanvasData] = useState(null);
  const [selectedTool, setSelectedTool] = useState("pencil");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);

  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("canvasId", canvasId);
    formData.append("type", "image");

    formData.append(
      "props",
      JSON.stringify({
        x: 50,
        y: 50,
        width: 200,
        height: 200,
      })
    );

    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/canvas/add/image-upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const res = await axios.get(`${API_BASE_URL}/api/v1/canvas/${canvasId}`);
      setCanvasData(res.data);
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image");
    }

    // Reset the input so you can upload the same file again if needed
    e.target.value = "";
  };

  const navigate = useNavigate();

  const handleDeleteCanvas = async (e, canvasId) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to delete this canvas?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/v1/canvas/delete/${canvasId}`);
      navigate(`/dashboard`);
    } catch (err) {
      console.error("Failed to delete canvas:", err);
      alert("Failed to delete canvas. Please try again.");
    }
  };

  // State for dragging
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // State for resizing
  const [resizingId, setResizingId] = useState(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({
    width: 0,
    height: 0,
  });

  // Drag start
  const onDragStart = (e, id) => {
    e.stopPropagation();
    setDraggingId(id);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Drag move
  const onDrag = (e) => {
    if (!draggingId) return;
    e.preventDefault();

    const container = document.getElementById("canvas-container");
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    const element = canvasData.elements.find((el) => el._id === draggingId);
    if (!element) return;

    const maxX = containerRect.width - element.props.width;
    const maxY = containerRect.height - element.props.height;

    let newX = e.clientX - containerRect.left - dragOffset.x;
    let newY = e.clientY - containerRect.top - dragOffset.y;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    setCanvasData((prev) => {
      const newElements = prev.elements.map((el) => {
        if (el._id === draggingId) {
          return {
            ...el,
            props: {
              ...el.props,
              x: newX,
              y: newY,
            },
          };
        }
        return el;
      });
      return { ...prev, elements: newElements };
    });
  };

  // Drag end - save to backend
  const onDragEnd = async () => {
    if (!draggingId) return;

    const element = canvasData.elements.find((el) => el._id === draggingId);
    if (!element) {
      setDraggingId(null);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/v1/canvas/update/image-props`, {
        canvasId,
        elementId: draggingId,
        props: {
          x: element.props.x,
          y: element.props.y,
        },
      });
    } catch (error) {
      console.error("Failed to update image position:", error);
      alert("Failed to save image position");
    }

    setDraggingId(null);
  };

  // Resize start
  const onResizeStart = (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingId(id);

    const element = canvasData.elements.find((el) => el._id === id);
    if (!element) return;

    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartSize({
      width: element.props.width,
      height: element.props.height,
    });
  };

  // Resize move
  const onResize = (e) => {
    if (!resizingId) return;
    e.preventDefault();

    const deltaX = e.clientX - resizeStartPos.x;
    const deltaY = e.clientY - resizeStartPos.y;

    setCanvasData((prev) => {
      const newElements = prev.elements.map((el) => {
        if (el._id === resizingId) {
          // Clamp max width and height so image does not overflow canvas bounds
          const maxWidth = prev.width - el.props.x;
          const maxHeight = prev.height - el.props.y;

          const newWidth = Math.min(
            Math.max(20, resizeStartSize.width + deltaX),
            maxWidth
          );
          const newHeight = Math.min(
            Math.max(20, resizeStartSize.height + deltaY),
            maxHeight
          );

          return {
            ...el,
            props: {
              ...el.props,
              width: newWidth,
              height: newHeight,
            },
          };
        }
        return el;
      });
      return { ...prev, elements: newElements };
    });
  };

  // Resize end - save to backend
  const onResizeEnd = async () => {
    if (!resizingId) return;

    const element = canvasData.elements.find((el) => el._id === resizingId);
    if (!element) {
      setResizingId(null);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/v1/canvas/update/image-props`, {
        canvasId,
        elementId: resizingId,
        props: {
          width: element.props.width,
          height: element.props.height,
        },
      });
    } catch (error) {
      console.error("Failed to update image size:", error);
      alert("Failed to save image size");
    }

    setResizingId(null);
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (draggingId) {
        onDrag(e);
      } else if (resizingId) {
        onResize(e);
      }
    };

    const onMouseUp = () => {
      if (draggingId) {
        onDragEnd();
      }
      if (resizingId) {
        onResizeEnd();
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [
    draggingId,
    resizingId,
    dragOffset,
    resizeStartPos,
    resizeStartSize,
    canvasData,
  ]);

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
          onClick={() => {
            setSelectedTool("image");
            fileInputRef.current.click();
          }}
        >
          Image
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleImageUpload}
        />

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
        <button
          onClick={(e) => handleDeleteCanvas(e, canvasId)}
          style={{
            backgroundColor: "#eb4848ff",
            color: "white",
            border: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            zIndex: 10,
          }}
          title="Delete Canvas"
          aria-label="Delete Canvas"
        >
          Delete
        </button>
      </div>

      <div
        id="canvas-container"
        className="canvas-wrapper"
        style={{ position: "relative" }}
      >
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
          width={canvasData?.width}
          height={canvasData?.height}
        />

        {canvasData?.elements
          .filter((el) => el.type === "image")
          .map((el) => (
            <div
              key={el._id}
              style={{
                position: "absolute",
                left: el.props.x,
                top: el.props.y,
                width: el.props.width,
                height: el.props.height,
                cursor: draggingId === el._id ? "grabbing" : "grab",
                boxSizing: "border-box",
                border:
                  draggingId === el._id || resizingId === el._id
                    ? "2px solid blue"
                    : "none",
                userSelect: "none",
                touchAction: "none",
                zIndex: 20, // above canvas
              }}
              onMouseDown={(e) => onDragStart(e, el._id)}
            >
              <img
                src={el.props.url}
                alt="canvas-img"
                style={{
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  userSelect: "none",
                  display: "block",
                }}
                draggable={false}
              />
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  width: 15,
                  height: 15,
                  background: "blue",
                  cursor: "se-resize",
                  userSelect: "none",
                }}
                onMouseDown={(e) => onResizeStart(e, el._id)}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default Editor;
