const axios = require("axios").default;

export default axios.create({
  baseURL: "http:///192.168.148.84:5000",
  withCredentials: true,
});
