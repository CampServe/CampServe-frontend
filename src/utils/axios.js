const axios = require("axios").default;

export default axios.create({
  baseURL: "http:///100.66.26.121:5000",
  withCredentials: true,
});
