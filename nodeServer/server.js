const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, "../client")));

app.get("/favicon.ico", (req, res) => res.status(204));

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

const messages = [];

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.emit("chat-history", messages);

    socket.on("chat-message", (data) => {

        if (!data.time) {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, "0");
            const ampm = hours >= 12 ? "PM" : "AM";
            const hour12 = hours % 12 || 12;
            data.time = `${hour12}:${minutes} ${ampm}`;
        }

        messages.push(data);
        io.emit("chat-message", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
