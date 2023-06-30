import axios from "../utils/axios";

export const getProviderRequests = async (data) => {
  try {
    const response = await axios.post("/get_all_provider_requests", data);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
