const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
dotenv.config();

// Connect to the database

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 1234;

let server

connectDB()
    .then(() => {
         server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
    });

// Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// const server = app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: ["https://chat-app-frontend-chi-lemon.vercel.app"]
    }
});

io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("setup", (userData) => {
        console.log(`User connected: ${userData._id}`);
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on("typing", (room) => {
        socket.in(room).emit("typing");
    });

    socket.on("stop typing", (room) => {
        socket.in(room).emit("stop typing");
    });

    socket.on("new message", (newMessageReceived) => {
        const chat = newMessageReceived.chat;

        if (!chat.users) {
            return console.log("chat.users not defined");
        }

        chat.users.forEach(user => {
            if (user._id === newMessageReceived.sender._id) {
                return;
            }

            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});
