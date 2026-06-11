# Real-Time Collaboration Tool

## Internship Task - 3

### Internship Organization

CODTECH IT Solutions

### Intern Name

Subhrajit Behera

### Project Title

Real-Time Collaboration Tool using React, Node.js, Socket.IO, and MongoDB

---

# Project Overview

The Real-Time Collaboration Tool is a full-stack web application that allows multiple users to collaborate on shared documents in real time. Users can register, log in, create documents, join collaboration rooms, and edit content simultaneously.

The application uses Socket.IO for real-time communication, MongoDB for document storage, JWT authentication for secure access, and React for the frontend interface.

This project demonstrates real-time synchronization, authentication, database integration, and collaborative document editing.

---

# Features

## Authentication

* User Registration
* User Login
* Password Encryption using bcrypt
* JWT Authentication
* Secure User Sessions
* Logout Functionality

## Document Management

* Create New Documents
* View Existing Documents
* Multiple Document Support
* Document Title Management
* Document Storage in MongoDB

## Real-Time Collaboration

* Create Collaboration Rooms
* Join Existing Rooms
* Live Document Editing
* Instant Content Synchronization
* Multiple Users Editing Simultaneously
* Online Users List
* Typing Indicator

## Editor Features

* Rich Text Editor (React Quill)
* Formatting Tools
* Shared Workspace
* Auto Save to Database

## Export Features

* Export Document as PDF
* Download Shared Notes

---

# Technologies Used

## Frontend

* React.js
* Vite
* React Quill
* Axios
* Socket.IO Client
* HTML2Canvas
* jsPDF

## Backend

* Node.js
* Express.js
* Socket.IO
* JWT Authentication
* bcryptjs

## Database

* MongoDB
* Mongoose

---

# Project Architecture

```text
Client (React)
        │
        ▼
Socket.IO Client
        │
        ▼
Node.js + Express Server
        │
        ▼
Socket.IO Server
        │
        ▼
MongoDB Database
```

---

# Project Structure

```text
real-time-collaboration-tool/

│
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── server.js
│   ├── .env
│   ├── package.json
│   └── node_modules/
│
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone <https://github.com/subhrajitbehera2021/real-time-collaboration-tool.git>
```

## Backend Setup

```bash
cd server
npm install
```

### Install Backend Dependencies

```bash
npm install express mongoose cors bcryptjs jsonwebtoken socket.io dotenv nodemon
```

### Create Environment File

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/collaboration_tool
JWT_SECRET=mysecretkey123
```

### Start Backend

```bash
npm run dev
```

Expected Output:

```text
MongoDB Connected
Server running on port 5000
```

---

# Frontend Setup

```bash
cd client
npm install
```

### Install Frontend Dependencies

```bash
npm install axios socket.io-client
npm install react-quill-new
npm install jspdf html2canvas
```

### Start Frontend

```bash
npm run dev
```

Application URL:

```text
http://localhost:5173
```

---

# How It Works

## Step 1

User registers an account.

```text
Register
↓
Login
```

## Step 2

User logs in and enters dashboard.

```text
Dashboard
```

## Step 3

User creates a new document.

```text
Create Document
↓
Room Generated
```

## Step 4

Another user joins the same room.

```text
Join Room
```

## Step 5

Users edit the document together.

```text
User A Types
        ↓
Socket.IO
        ↓
Server
        ↓
User B Receives Changes Instantly
```

## Step 6

Document content is automatically saved in MongoDB.

```text
Edit
↓
Save
↓
MongoDB
```

---

# API Endpoints

## Authentication

### Register User

```http
POST /api/register
```

### Login User

```http
POST /api/login
```

## Documents

### Create Document

```http
POST /api/documents
```

### Get User Documents

```http
GET /api/documents/:email
```

### Get Document By Room

```http
GET /api/document/room/:roomId
```

---

# Database Collections

## Users Collection

```json
{
  "name": "Subhrajit",
  "email": "subhrajit@gmail.com",
  "password": "hashed_password"
}
```

## Documents Collection

```json
{
  "roomId": "doc_1749510000",
  "title": "Internship Report",
  "content": "<p>Document Content</p>",
  "ownerEmail": "subhrajit@gmail.com"
}
```

---

# Learning Outcomes

Through this project, I learned:

* React Fundamentals
* React Hooks
* Authentication using JWT
* Password Hashing using bcrypt
* MongoDB Integration
* Mongoose ODM
* Real-Time Communication with Socket.IO
* Room-Based Collaboration
* Rich Text Editing
* PDF Generation
* Full Stack MERN Development

---

# Future Enhancements

* Document Sharing Links
* Version History
* Comments System
* Real-Time Cursor Tracking
* Team Management
* Dark Mode
* File Uploads
* Voice Collaboration
* AI Writing Assistant

---

# Conclusion

The Real-Time Collaboration Tool successfully enables multiple users to work together on shared documents in real time. By integrating React, Node.js, Socket.IO, MongoDB, and JWT authentication, the project demonstrates a practical implementation of collaborative web applications similar to Google Docs.

The project fulfills the internship requirements and provides hands-on experience in full-stack real-time application development.

---

## Developed By

Subhrajit Behera

CODTECH Internship Task - 3

Real-Time Collaboration Tool using React, Socket.IO, MongoDB, and JWT Authentication
