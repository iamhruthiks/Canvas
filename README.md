# 📁 Project Title: Canvas

## 💡 Overview

**Canvas** is a full stack application built with the MERN stack. It allows users to crete create, draw, and export your designs with ease.

---

## ✨ Features

- **Create Custom Canvas** – Users can create their own canvas with custom dimensions.  
- **Sorting** – Sort canvases by `updatedAt` for easy access to recent work.  
- **Pencil Tool** – Draw freely with a customizable pencil.  
- **Eraser Tool** – Erase specific parts of the canvas using a custom eraser.  
- **Rectangle Tool** – Create rectangles by simply clicking and dragging.  
- **Circle Tool** – Create circles quickly by dragging on the canvas.  
- **Text Tool** – Add custom text anywhere on the canvas.  
- **Image Support** – Upload images, drag them around, and resize as needed.  
- **Delete** – Remove canvases permanently when no longer needed.  
- **Export** – Export your canvas to a PDF file in one click.  
  
---

## 🛠️ Tech Stack Used

- **Frontend**: Vite + React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB

---

## 🚀 How to Run the Application

### Prerequisites

- Node.js (v16 or later)
- MongoDB (local or cloud)
- npm

### **Open your terminal or command prompt.**

### Clone the Repository

```bash
git clone https://github.com/iamhruthiks/Canvas.git
```

### Backend Setup

### Navigate inside Backend Directory
```bash
cd Canvas/backend
```

### Set up environment variables
Create a `.env` file in the root directory of the backend folder and add the following environment variables:
```bash
MONGO_URI=<your_mongodb_uri>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api__secret>
```

### Start the Backend Server

```bash
npm run dev
```

### Access the Backend Server

- Base URL: `http://localhost:8000`

### Frontend Setup

### Navigate inside Frontend Directory
```bash
cd Canvas/frontend
```

### Set up environment variables
Create a `.env` file in the root directory of the frontend folder and add the following environment variables:
```bash
VITE_REACT_APP_API_BASE_URL=http://localhost:8000
```

### Start the Frontend App

```bash
npm run dev
```

### Access the frontend App

- Base URL: `http://localhost:5173`

---

## 🌐 Deployment

- 🌱 The frontend is deployed on Vercel and backend is deployed on Render.
- 🔴 Live App: https://canvas-five-wine.vercel.app
- 💡 Note: Users may experince lag whee erasing or data not laodng images ot dsasboard epmpy csue i have dploeyd bcakend in render on free version and due to inacative it pusts the server to sleep  somi reues ples wait for sime thing till the srevr wakes up. crt the sentences
---

## Author

[Hruthik S](https://github.com/iamhruthiks)

---

## Contact

For questions or support, please connect with me on [LinkedIn](https://www.linkedin.com/in/hruthiks).
