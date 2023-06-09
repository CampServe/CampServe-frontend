import axios from "../utils/axios";

export const getServiceProviders = async () => {
  try {
    const response = await axios.get("/get_all_services");
    return response.data.data;
  } catch (error) {
    console.error("Error retrieving service providers:", error);
    throw error;
  }
};

export const storeRatings = async (commentData) => {
  try {
    const response = await axios.post("/store_ratings", commentData);
    if (response.data.message == "Ratings stored successfully.") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
  }
};

export const getRatings = async (data) => {
  try {
    const response = await axios.post("/get_ratings", data);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const bookService = async (bookingData) => {
  try {
    const response = await axios.post("/book_services", bookingData);
    if (response.data.message == "Request added successfully") {
      return true;
    } else {
      return false;
    }
  } catch (error) {}
};

export const getServiceStatus = async (data) => {
  try {
    const response = await axios.post("/get_service_status", data);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getAllUserRequests = async (data) => {
  try {
    const response = await axios.post("/get_all_user_requests", data);
    // console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
