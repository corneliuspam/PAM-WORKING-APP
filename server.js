const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST"] }
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public","index.html"))
);

app.get("/dashboard", (req, res) =>
  res.sendFile(path.join(__dirname, "public","dashboard.html"))
);

// ✅ ADD — serve real files used by JS navigation
app.get("/dashboard.html", (req, res) =>
  res.sendFile(path.join(__dirname, "public","dashboard.html"))
);

app.get("/private-chat.html", (req, res) =>
  res.sendFile(path.join(__dirname, "public","private-chat.html"))
);

// Socket.IO
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("chat message", (data) => {
    io.emit("chat message", data);
  });

  // ===== PRIVATE CHAT SOCKETS =====
  socket.on("join private", room => {
    socket.join(room);
  });

  socket.on("private message", data => {
    socket.to(data.room).emit("private message", data);
  });

  socket.on("disconnect", () =>
    console.log("A user disconnected")
  );
});

// ✅ ADD — SPA fallback (DO NOT REMOVE)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);