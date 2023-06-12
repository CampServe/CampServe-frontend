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
