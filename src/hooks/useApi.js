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
    const response = await axios.post("./store_ratings", commentData);
    if (response.data.message == "Ratings stored successfully.") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
  }
};

export const getRatings = async (provider_id) => {
  try {
    const response = await axios.post("./get_ratings", {
      provider_id: provider_id,
    });
    return response.data;
    // console.log(response.data);
  } catch (error) {
    console.log(error);
  }
};
