const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const users = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log(`User registered: ${userId} with socket ID: ${socket.id}`);
  });

  socket.on("offer", ({ offer, target, sender }) => {
    const targetSocketId = users[target];
    if (targetSocketId) {
      io.to(targetSocketId).emit("offer", { offer, sender });
      console.log(`Offer sent from ${sender} to ${target}`);
    } else {
      console.error("Target user not found:", target);
    }
  });

  socket.on("answer", ({ answer, callerId }) => {
    const callerSocketId = users[callerId];
    if (callerSocketId) {
      io.to(callerSocketId).emit("answer", { answer });
      console.log(`Answer sent to ${callerId}`);
    } else {
      console.error("Caller user not found:", callerId);
    }
  });

  socket.on("ice-candidate", ({ target, candidate }) => {
    const targetSocketId = users[target];
    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", { candidate });
      console.log("ICE candidate sent");
    } else {
      console.error("Target user not found for ICE candidate:", target);
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        delete users[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
