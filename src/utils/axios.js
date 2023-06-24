const axios = require("axios").default;

export default axios.create({
  baseURL: "http://100.66.8.234:5000",
  withCredentials: true,
});
