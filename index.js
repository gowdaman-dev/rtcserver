const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express(); // Initialize Express
const server = createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const userSocketMap = {}; // Map user IDs to their socket IDs

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("register", (userId) => {
    userSocketMap[userId] = socket.id;
    console.log(`User registered: ${userId} -> ${socket.id}`);
  });

  socket.on("offer", ({ offer, target, sender }) => {
    const targetSocketId = userSocketMap[target];
    console.log("Sending offer to:", target);

    if (targetSocketId) {
      io.to(targetSocketId).emit("offer", { offer, sender });
    } else {
      socket.emit("error", "Target user not found or offline.");
    }
  });

  socket.on("answer", ({ answer, callerId }) => {
    const callerSocketId = userSocketMap[callerId];
    console.log("Sending answer to:", callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit("answer", { answer });
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    for (const [userId, id] of Object.entries(userSocketMap)) {
      if (id === socket.id) {
        delete userSocketMap[userId];
        console.log(`User unregistered: ${userId}`);
        break;
      }
    }
  });
});

// Serve a test route to confirm the server is running
app.get("/", (req, res) => {
  res.send("WebSocket server is running.");
});

// Use dynamic port for deployment
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});