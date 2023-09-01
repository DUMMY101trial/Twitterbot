const http = require("http");
const express = require("express");
const { automatedPosting } = require("./index");
const dotenv = require("dotenv");
const app = express();
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

//middleware
dotenv.config();
app.use(express.json());
app.use(express.static("public"));

//endpoints
app.get("/botpost", (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      message: "Started automated posting service",
    });
    automatedPosting(io);
  } catch (error) {
    io.emit("bot", error.message);
    res.json({
      status: "failed",
      message: error.message,
    });
  }
});
app.get("/", (req, res) => {
  res.sendFile("./public/index.html");
});
app.get("/stop", (req, res) => {
  io.emit("bot", {
    color: "red",
    message: "BOT SERVICE STOPPED",
  });
  res.status(200).json({ success: "success" });
});

//web sockets
io.on("connect", (socket) => {
  console.log("CLIENT CONNECTED");
  socket.on("bot", (data) => {
    console.log("BOT END POINT HIT");
    socket.emit(data);
  });
  socket.on("disconnect", (data) => {
    console.log("SOCKETS DISCONNECTED");
  });
});

//start server
const port = process.env.PORT || 1680;

server.listen(port, async () => {
  console.log("listening on port ", port);
});
