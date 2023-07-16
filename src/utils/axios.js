import io from "socket.io-client";

const axios = require("axios").default;
const url = "http://100.66.5.222:5000";

const socket = io(url, { autoConnect: false, transports: ["websocket"] });

export { socket };

export default axios.create({
  baseURL: url,
  withCredentials: true,
});
