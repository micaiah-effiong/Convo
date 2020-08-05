let io = require("socket.io")();

io.on("connection", (socket) => {
  socket.on("joined", (socketId, peerId) => {
    console.log("socketId", socketId, "peerId", peerId);
    socket.broadcast.emit("joined", socketId, peerId);
  });
});

module.exports = io;
