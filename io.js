let io = require("socket.io")();

io.on("connection", (socket) => {
  socket.on("joined", (socketId, peerId) => {
    console.log("socketId", socketId, "peerId", peerId);
    socket.$peerId = peerId;
    socket.broadcast.emit("new-user", socketId, peerId);
  });

  socket.on("disconnect", () => {
    console.log(">> disconnection", socket.$peerId);
    io.emit("disconnect", socket.id, socket.$peerId);
  });
});

module.exports = io;
