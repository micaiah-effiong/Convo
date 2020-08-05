let peer = new Peer({
  host: "localhost",
  port: 3000,
  path: "/peerjs",
  debug: 3,
});

let socket = io();
let conn;

peer.on("open", function (id) {
  console.log("peer id", id);
  socket.emit("joined", socket.id, id);
});

peer.on("connection", function (conn) {
  console.log("new connection", conn);
});

socket.on("joined", (socketId, peerId) => {
  console.log("socketId", socketId, "peerId", peerId);
  conn = peer.connect(peerId);
});

// call
peer.call()
peer.on("call" (stream)=>{})