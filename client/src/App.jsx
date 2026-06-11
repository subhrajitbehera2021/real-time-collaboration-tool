import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import ReactQuill from "react-quill-new";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "react-quill-new/dist/quill.snow.css";
import "./App.css";

const socket = io("http://localhost:5000");

function App() {
  const [page, setPage] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [docTitle, setDocTitle] = useState("");
  const [roomId, setRoomId] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");

  const [content, setContent] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [notice, setNotice] = useState("");

  const API = "http://localhost:5000/api";

  const fetchDocuments = async (userEmail) => {
    try {
      const res = await axios.get(`${API}/documents/${userEmail}`);
      setDocuments(res.data);
    } catch {
      alert("Failed to load documents");
    }
  };

  const register = async () => {
    try {
      await axios.post(`${API}/register`, { name, email, password });
      alert("Registration successful. Please login.");
      setPage("login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API}/login`, { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);
      fetchDocuments(res.data.user.email);
      setPage("dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const createDocument = async () => {
    if (!docTitle.trim()) {
      alert("Please enter document title");
      return;
    }

    try {
      const res = await axios.post(`${API}/documents`, {
        title: docTitle,
        ownerEmail: user.email,
      });

      setDocTitle("");
      fetchDocuments(user.email);

      openDocument(res.data.roomId);
    } catch {
      alert("Document creation failed");
    }
  };

  const openDocument = (id) => {
    setCurrentRoom(id);

    socket.emit("join_room", {
      roomId: id,
      username: user.name,
    });

    setPage("editor");
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      alert("Please enter room ID");
      return;
    }

    openDocument(roomId);
  };

  const handleTextChange = (value) => {
    setContent(value);

    socket.emit("text_change", {
      roomId: currentRoom,
      content: value,
    });

    socket.emit("typing", {
      roomId: currentRoom,
      username: user.name,
    });
  };

  const exportPDF = async () => {
    const input = document.getElementById("pdf-content");

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    pdf.save(`${currentTitle || "document"}.pdf`);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("login");
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchDocuments(parsedUser.email);
      setPage("dashboard");
    }

    socket.on("load_document", (data) => {
      setCurrentTitle(data.title);
      setContent(data.content);
    });

    socket.on("receive_text", (data) => {
      setContent(data);
    });

    socket.on("online_users", (data) => {
      setUsers(data);
    });

    socket.on("user_typing", (data) => {
      setTyping(data);
      setTimeout(() => setTyping(""), 1500);
    });

    socket.on("user_joined", (data) => {
      setNotice(data);
      setTimeout(() => setNotice(""), 2000);
    });

    return () => {
      socket.off("load_document");
      socket.off("receive_text");
      socket.off("online_users");
      socket.off("user_typing");
      socket.off("user_joined");
    };
  }, []);

  if (page === "login") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Collab Tool</h1>
          <p>Login to start real-time collaboration</p>

          <input
            type="email"
            placeholder="Email address"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={login}>Login</button>

          <p className="switch">
            New user?{" "}
            <span onClick={() => setPage("register")}>Create account</span>
          </p>
        </div>
      </div>
    );
  }

  if (page === "register") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Create Account</h1>
          <p>Register to use collaboration tool</p>

          <input
            type="text"
            placeholder="Full name"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email address"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={register}>Register</button>

          <p className="switch">
            Already have account?{" "}
            <span onClick={() => setPage("login")}>Login</span>
          </p>
        </div>
      </div>
    );
  }

  if (page === "dashboard") {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <div className="topbar">
            <div>
              <h1>Dashboard</h1>
              <p>Welcome, {user?.name}</p>
            </div>

            <button className="logout" onClick={logout}>
              Logout
            </button>
          </div>

          <div className="room-box">
            <h2>Create New Document</h2>

            <input
              type="text"
              placeholder="Enter document title"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
            />

            <button onClick={createDocument}>Create Document</button>
          </div>

          <div className="room-box">
            <h2>Join Existing Room</h2>

            <input
              type="text"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />

            <button onClick={joinRoom}>Join Room</button>
          </div>

          <div className="documents-section">
            <h2>Your Documents</h2>

            {documents.length === 0 ? (
              <p>No documents created yet.</p>
            ) : (
              documents.map((doc) => (
                <div className="document-card" key={doc._id}>
                  <div>
                    <h3>{doc.title}</h3>
                    <p>Room ID: {doc.roomId}</p>
                  </div>

                  <button onClick={() => openDocument(doc.roomId)}>Open</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <aside className="sidebar">
        <h2>Document</h2>
        <p className="room-name">{currentTitle}</p>

        <h3>Room ID</h3>
        <p className="room-name">{currentRoom}</p>

        <h3>Online Users</h3>
        {users.map((u) => (
          <p className="user" key={u.id}>
            🟢 {u.username}
          </p>
        ))}

        <button className="leave" onClick={() => setPage("dashboard")}>
          Back to Dashboard
        </button>
      </aside>

      <main className="editor-main">
        <header className="editor-header">
          <div>
            <h1>{currentTitle}</h1>
            <p>Logged in as: {user?.name}</p>
          </div>

          <button className="export-btn" onClick={exportPDF}>
            Export PDF
          </button>
        </header>

        {notice && <p className="notice">{notice}</p>}
        {typing && <p className="typing">{typing}</p>}

        <div id="pdf-content" className="pdf-area">
          <h1>{currentTitle}</h1>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={handleTextChange}
            placeholder="Start writing your shared document here..."
          />
        </div>
      </main>
    </div>
  );
}

export default App;