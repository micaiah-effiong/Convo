let vBox = document.getElementById("videoBox");
let shareScreenBtn = document.getElementById("shareScreen");
let selfVideo = document.createElement("video");
let socketPeer = new Peer({
  host: location.hostname,
  port: 3000,
  path: "/peerjs",
  // debug: 3,
});
let availblePeers = [];
let socket = io();
let activeCaller = [];
let screenSharing = false;

selfVideo.muted = true;
shareScreenBtn.onclick = shareScreen;
socketPeer.on("open", () => {});

socket.on("reconnect", (info) => {
  console.log("reconnect info", info);
  // socketPeer.reconnect();
});

socket.on("disconnect", (socketId, peerId) => {
  console.log("disconnect", socketId, peerId);
  availblePeers.splice(availblePeers.indexOf(peerId), 1);
  socketPeer.connections[peerId][0].close();
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
      console.log(">> incoming call", call);
      if (!activeCaller.includes(call.peer)) {
        activeCaller.push(call.peer);
      }
      call.answer(stream);
      let video = document.createElement("video");
      call.on("stream", (remoteStream) => {
        addVideoStream(video, remoteStream);
      });
      call.on("close", () => {
        console.log(">> call ended");
        activeCaller.splice(activeCaller.indexOf(call.peer), 1);
        video.remove();
      });
    });

    // listening for new users
    socket.on("new-user", (socketId, peerId) => {
      // console.log(">> new-user");
      availblePeers.push(peerId);
      connectAndSendStream(peerId, stream);
    });

    addVideoStream(selfVideo, stream);
  })
  .catch(console.error);

function connectAndSendStream(peerId, stream, sharing) {
  let call = socketPeer.call(peerId, stream);

  // console.log(">> connect And Send Stream", stream, call);
  let video = document.createElement("video");

  call.on("close", () => {
    // console.log(">> call ended");
    video.remove();
  });
  if (!sharing) {
    call.on("stream", (remoteStream) => {
      // console.log(">> incoming stream");
      addVideoStream(video, remoteStream);
    });
  }
}

function addVideoStream(video, stream) {
  // console.log(">> add Video Stream");
  video.srcObject = stream;
  video.autoplay = true;
  vBox.append(video);
}

async function captureScreen(options) {
  let captureStream;
  try {
    captureStream = await navigator.mediaDevices.getDisplayMedia();
    alert(!!captureStream);
  } catch (err) {
    console.error(">>>", err);
  }
  return captureStream;
}

function shareScreen() {
  if (screenSharing) {
  }
  document.querySelector("#info").innerText += "screen capture is on\n";

  captureScreen().then((stream) => {
    for (id in socketPeer.connections) {
      connectAndSendStream(id, stream, true);
    }
  });
}
