import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const MIN_SIZE = 100;
const MAX_SIZE = 5000;

const Dashboard = () => {
  const [canvases, setCanvases] = useState([]);
  const [newCanvas, setNewCanvas] = useState({
    name: "",
    width: "800",
    height: "600",
  });

  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

  // Fetch canvases
  const fetchCanvases = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/canvas/all`);
      const sorted = res.data.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setCanvases(sorted);
    } catch (err) {
      console.error("Error fetching canvases:", err);
    }
  };

  useEffect(() => {
    fetchCanvases();
  }, []);

  const handleCardClick = (id) => {
    navigate(`/editor/${id}`);
  };

  // DELETE canvas handler
  const handleDeleteCanvas = async (e, canvasId) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to delete this canvas?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/v1/canvas/delete/${canvasId}`);
      fetchCanvases(); // Refresh list after delete
    } catch (err) {
      console.error("Failed to delete canvas:", err);
      alert("Failed to delete canvas. Please try again.");
    }
  };

  const handleCreateCanvas = async () => {
    if (!newCanvas.name.trim()) {
      return alert("Please enter a name");
    }

    const widthNum = Number(newCanvas.width);
    const heightNum = Number(newCanvas.height);

    if (!widthNum || !heightNum) {
      return alert("Width and height must be valid numbers.");
    }

    if (
      widthNum < MIN_SIZE ||
      widthNum > MAX_SIZE ||
      heightNum < MIN_SIZE ||
      heightNum > MAX_SIZE
    ) {
      return alert(
        `Width and height must be between ${MIN_SIZE}px and ${MAX_SIZE}px.`
      );
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/canvas/init`, {
        name: newCanvas.name.trim(),
        width: widthNum,
        height: heightNum,
      });

      const newCanvasId = res.data.canvasId;
      if (newCanvasId) {
        navigate(`/editor/${newCanvasId}`);
      }

      setNewCanvas({ name: "", width: "800", height: "600" });
      fetchCanvases();
      document.getElementById("closeModalBtn").click();
    } catch (err) {
      console.error("Error creating canvas:", err);
    }
  };

  return (
    <div className="container dashboard-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="dashboard-title">Dashboard</h1>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#newCanvasModal"
        >
          + New Canvas
        </button>
      </div>

      {/* Canvas List */}
      <div className="row">
        {canvases.map((canvas) => (
          <div
            key={canvas._id}
            className="col-12 col-md-4 mb-4"
            onClick={() => handleCardClick(canvas._id)}
            style={{ cursor: "pointer", position: "relative" }}
          >
            <div
              className="dashboard-card shadow"
              style={{ position: "relative" }}
            >
              {/* Red Delete Button */}
              <button
                onClick={(e) => handleDeleteCanvas(e, canvas._id)}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
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

              <p className="canvas-name">{canvas.name || "Untitled"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* New Canvas Modal */}
      <div
        className="modal fade"
        id="newCanvasModal"
        tabIndex="-1"
        aria-labelledby="newCanvasModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="newCanvasModalLabel">
                Create New Canvas
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              {/* Name */}
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Canvas Name"
                value={newCanvas.name}
                onChange={(e) =>
                  setNewCanvas({ ...newCanvas, name: e.target.value })
                }
              />

              {/* Width */}
              <label className="form-label">
                Width (in pixels, {MIN_SIZE}-{MAX_SIZE})
              </label>
              <input
                type="number"
                className="form-control mb-3"
                value={newCanvas.width}
                onChange={(e) =>
                  setNewCanvas({ ...newCanvas, width: e.target.value })
                }
                min={MIN_SIZE}
                max={MAX_SIZE}
              />

              {/* Height */}
              <label className="form-label">
                Height (in pixels, {MIN_SIZE}-{MAX_SIZE})
              </label>
              <input
                type="number"
                className="form-control"
                value={newCanvas.height}
                onChange={(e) =>
                  setNewCanvas({ ...newCanvas, height: e.target.value })
                }
                min={MIN_SIZE}
                max={MAX_SIZE}
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                id="closeModalBtn"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateCanvas}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
