import { io } from "socket.io-client";
const SOCKET_URL = "http://localhost:6001";
let socket = null;
function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true
    });
  }
  return socket;
}
function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
export {
  disconnectSocket as d,
  getSocket as g
};
