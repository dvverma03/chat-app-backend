const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

dotenv.config();

const userRoutes = require("./routes/userRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");

connectDB();

const app = express();
app.use(cors({
  origin:  ["http://localhost:3000",process.env.FRONTEND_URL],
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 1234;

// Define routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin:["http://localhost:3000",process.env.FRONTEND_URL],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO event handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("setup", (userData) => {
    console.log(userData._id);
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room:", room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach(user => {
      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
httpServer.listen(PORT, () => console.log(`Server is running on ${PORT}`));
