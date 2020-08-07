let vBox = document.getElementById("videoBox");
let socketPeer = new Peer({
  host: location.hostname,
  port: 3000,
  path: "/peerjs",
  // debug: 3,
});

let socket = io();
let selfVideo = document.createElement("video");
selfVideo.muted = true;

socketPeer.on("open", () => {});

socket.on("disconnect", (socketId, peerId) => {
  console.log("disconnect", socketId, peerId);
});

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    socket.emit("joined", socket.id, socketPeer.id);

    // listen for calls
    socketPeer.on("call", (call) => {
      console.log(">> incoming call");

      call.answer(stream);
      let video = document.createElement("video");
      call.on("stream", (remoteStream) => {
        addVideoStream(video, remoteStream);
      });
      call.on("close", () => {
        console.log(">> call ended");
        video.remove();
      });
    });

    // listening for new users
    socket.on("new-user", (socketId, peerId) => {
      console.log(">> new-user");
      connectAndSendStream(peerId, stream);
    });

    addVideoStream(selfVideo, stream);
  })
  .catch(console.error);

function connectAndSendStream(peerId, stream) {
  let call = socketPeer.call(peerId, stream);
  console.log(">> connect And Send Stream", stream, call);
  let video = document.createElement("video");

  call.on("close", () => {
    console.log(">> call ended");
    video.remove();
  });

  call.on("stream", (remoteStream) => {
    console.log(">> incoming stream");
    addVideoStream(video, remoteStream);
  });
}

function addVideoStream(video, stream) {
  console.log(">> add Video Stream");
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  vBox.append(video);
}
