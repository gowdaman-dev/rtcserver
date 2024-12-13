// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store users and their corresponding socket IDs
let users = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Register a user
  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log('Registered user:', userId);
  });

  // Handle an incoming offer
  socket.on('offer', ({ offer, target, sender }) => {
    console.log('Received offer from:', sender);
    const targetSocketId = users[target];
    if (targetSocketId) {
      io.to(targetSocketId).emit('offer', { offer, sender });
    }
  });

  // Handle an incoming answer
  socket.on('answer', ({ answer, callerId }) => {
    const callerSocketId = users[callerId];
    if (callerSocketId) {
      io.to(callerSocketId).emit('answer', { answer });
    }
  });

  // Handle ICE candidates
  socket.on('ice-candidate', ({ candidate, target }) => {
    const targetSocketId = users[target];
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice-candidate', { candidate });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove the user from the users object
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
