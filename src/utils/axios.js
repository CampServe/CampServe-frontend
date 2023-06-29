const axios = require("axios").default;

export default axios.create({
  baseURL: "http://100.66.2.81:5000",
  withCredentials: true,
});
