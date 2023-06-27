const axios = require("axios").default;

export default axios.create({
  baseURL: "http://100.66.1.249:5000",
  withCredentials: true,
});
