import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Dashboard = () => {
  const [canvases, setCanvases] = useState([]);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

  useEffect(() => {
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
    fetchCanvases();
  }, []);

  const handleCardClick = (id) => {
    navigate(`/editor/${id}`);
  };

  return (
    <div className="container dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <div className="row">
        {canvases.map((canvas) => (
          <div
            key={canvas._id}
            className="col-12 col-md-4 mb-4"
            onClick={() => handleCardClick(canvas._id)}
            style={{ cursor: "pointer" }}
          >
            <div className="dashboard-card">
              <p className="canvas-name">{canvas.name || "Untitled"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
