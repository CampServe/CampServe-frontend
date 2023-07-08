import axios from "../utils/axios";

export const getProviderRequests = async (data) => {
  try {
    const response = await axios.post("/get_all_provider_requests", data);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const changeRequestStatus = async (data) => {
  try {
    const response = await axios.post("/change_request_status", data);
    if (response.data.message == "Request status updated successfully.") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
  }
};

export const getProviderInfo = async (provider_id) => {
  try {
    const response = await axios.post("/get_provider_info", {
      provider_id: provider_id,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
