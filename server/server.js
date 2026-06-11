const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
  },
  { timestamps: true }
);

const DocumentSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    ownerEmail: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
const Document = mongoose.model("Document", DocumentSchema);

app.get("/", (req, res) => {
  res.json({ message: "Real-Time Collaboration Backend Running" });
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/documents", async (req, res) => {
  try {
    const { title, ownerEmail } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Document title is required" });
    }

    const roomId = "doc_" + Date.now();

    const document = await Document.create({
      roomId,
      title,
      content: "",
      ownerEmail,
    });

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: "Document creation failed" });
  }
});

app.get("/api/documents/:email", async (req, res) => {
  try {
    const documents = await Document.find({
      ownerEmail: req.params.email,
    }).sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch documents" });
  }
});

app.get("/api/document/room/:roomId", async (req, res) => {
  try {
    const document = await Document.findOne({
      roomId: req.params.roomId,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch document" });
  }
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let roomUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", async ({ roomId, username }) => {
    try {
      socket.join(roomId);

      if (!roomUsers[roomId]) {
        roomUsers[roomId] = [];
      }

      roomUsers[roomId] = roomUsers[roomId].filter(
        (user) => user.id !== socket.id
      );

      roomUsers[roomId].push({
        id: socket.id,
        username,
      });

      let document = await Document.findOne({ roomId });

      if (!document) {
        document = await Document.create({
          roomId,
          title: "Untitled Document",
          content: "",
        });
      }

      socket.emit("load_document", {
        title: document.title,
        content: document.content,
        roomId: document.roomId,
      });

      io.to(roomId).emit("online_users", roomUsers[roomId]);

      socket.to(roomId).emit("user_joined", `${username} joined the room`);
    } catch (error) {
      socket.emit("server_error", "Failed to join room");
    }
  });

  socket.on("text_change", async ({ roomId, content }) => {
    try {
      socket.to(roomId).emit("receive_text", content);

      await Document.findOneAndUpdate(
        { roomId },
        { content },
        { upsert: true }
      );
    } catch (error) {
      socket.emit("server_error", "Failed to save document");
    }
  });

  socket.on("typing", ({ roomId, username }) => {
    socket.to(roomId).emit("user_typing", `${username} is typing...`);
  });

  socket.on("disconnect", () => {
    for (const roomId in roomUsers) {
      roomUsers[roomId] = roomUsers[roomId].filter(
        (user) => user.id !== socket.id
      );

      io.to(roomId).emit("online_users", roomUsers[roomId]);
    }

    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});