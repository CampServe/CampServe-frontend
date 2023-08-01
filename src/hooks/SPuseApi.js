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

export const addService = async (user_id, serviceData) => {
  const data = {
    user_id: user_id,
    selectedSubcategories: serviceData,
  };
  try {
    const response = await axios.post("/add_new_service", data);
    if (response.data.status === "New Service added") {
      return true;
    } else {
      return false;
    }
  } catch (error) {}
};

export const updateDetails = async (providerDetails) => {
  try {
    const response = await axios.post("/update_provider", providerDetails);
    if (response.data.message === "Data updated successfully") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
  }
};

export const requestMoney = async (requestData) => {
  try {
    const response = await axios.post("/request_money", requestData);
    if (response.data.message === "success") {
      return true;
    } else {
      return false;
    }
  } catch (error) {}
};
