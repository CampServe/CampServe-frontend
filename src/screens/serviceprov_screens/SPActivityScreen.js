import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import {
  changeRequestStatus,
  getProviderInfo,
  getProviderRequests,
} from "../../hooks/SPuseApi";
import useAuth from "../../hooks/useAuth";
import { SafeAreaView } from "react-native-safe-area-context";
import Loader from "../../components/Loader";
import CustomHeader from "../../components/CustomHeader";
import { ScrollView } from "react-native";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";
import { DotIndicator } from "react-native-indicators";
import useSearch from "../../hooks/useSearch";

const SPActivityScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");
  const [activeSubcategory, setActiveSubcategory] = useState("");
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [loadingRequestId, setLoadingRequestId] = useState(null);
  const [loadingActionType, setLoadingActionType] = useState(null);
  const [actionCompleted, setActionCompleted] = useState(true);
  const { searchQueries, updateSearchQuery } = useSearch();
  const [subData, setSubData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsRequestsLoading(true);

        const fetchRequestsPromise = getProviderRequests({
          provider_id: user.provider_id,
        });
        const getProviderInfoPromise = getProviderInfo(user.provider_id);

        const [requestsResponse, providerInfoResponse] = await Promise.all([
          fetchRequestsPromise,
          getProviderInfoPromise,
        ]);

        const { sub_categories, ...otherData } = providerInfoResponse;
        setSubData(sub_categories);

        if (requestsResponse.message) {
          setRequests([]);
        } else {
          setRequests(requestsResponse.all_requests);
        }
      } catch (error) {
        console.log(error);
        setRequests([]);
      } finally {
        setIsRequestsLoading(false);
      }
    };

    fetchData();
  }, [actionCompleted]);

  const subcategories = Object.keys(subData);

  useEffect(() => {
    filterBySubcategory(subcategories[0]);
  }, [requests, actionCompleted]);

  useEffect(() => {
    filterRequests("All");
  }, [requests, filteredSubcategories, actionCompleted]);

  const triggerAction = async (requestId, actionType) => {
    if (loadingRequestId || loadingActionType) {
      return;
    }

    setLoadingRequestId(requestId);
    setLoadingActionType(actionType);

    const data = {
      request_id: requestId,
      action_type: actionType,
    };

    try {
      const response = await changeRequestStatus(data);
      if (response) {
        setActionCompleted(!actionCompleted);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingRequestId(null);
      setLoadingActionType(null);
    }
  };

  const filterConditions = {
    All: "All",
    Pending: "Pending",
    "In Progress": "In Progress",
    Completed: "Completed",
    Declined: "Declined",
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${formattedDate}, ${formattedTime}`;
  };

  const filterRequests = (filterType) => {
    let filtered = filteredSubcategories;

    if (filterType === "Pending") {
      filtered = filteredSubcategories.filter(
        (req) =>
          req.status_acc_dec === "no action" &&
          req.status_comp_inco === "no action"
      );
    } else if (filterType === "Completed") {
      filtered = filteredSubcategories.filter(
        (req) =>
          req.status_acc_dec === "accepted" &&
          req.status_comp_inco === "complete"
      );
    } else if (filterType === "Declined") {
      filtered = filteredSubcategories.filter(
        (req) =>
          req.status_acc_dec === "declined" &&
          req.status_comp_inco === "no action"
      );
    } else if (filterType === "In Progress") {
      filtered = filteredSubcategories.filter(
        (req) =>
          req.status_acc_dec === "accepted" &&
          req.status_comp_inco === "incomplete"
      );
    }

    const searchQuery = searchQueries["SPrequest"]?.trim().toLowerCase();

    if (searchQuery) {
      filtered = filtered.filter(
        (req) =>
          req.first_name.toLowerCase().includes(searchQuery) ||
          req.last_name.toLowerCase().includes(searchQuery)
      );
    }

    setFilteredRequests(filtered);
    setActiveFilter(filterType);
  };

  useEffect(() => {
    filterRequests(activeFilter);
  }, [searchQueries]);

  const filterBySubcategory = (subcategory) => {
    const filtered = requests.filter((req) => req.subcategory === subcategory);
    setFilteredSubcategories(filtered);
    setActiveSubcategory(subcategory);
  };

  const renderItem = ({ item }) => {
    let statusColor = "gray";
    let statusText = "";

    if (
      item.status_acc_dec == "no action" &&
      item.status_comp_inco == "no action"
    ) {
      statusColor = "#B2CCFF";
      statusText = "Pending";
      textColor = "#084B8A";
    } else if (
      item.status_acc_dec == "accepted" &&
      item.status_comp_inco == "complete"
    ) {
      statusColor = "#A2D9A1";
      statusText = "Completed";
      textColor = "#007F00";
    } else if (
      item.status_acc_dec == "declined" &&
      item.status_comp_inco == "no action"
    ) {
      statusColor = "#FFB2B2";
      statusText = "Declined";
      textColor = "#B30000";
    } else if (
      item.status_acc_dec == "accepted" &&
      item.status_comp_inco == "incomplete"
    ) {
      statusColor = "#FFF7AA";
      statusText = "In Progress";
      textColor = "#D1A800";
    }
    return (
      <TouchableOpacity
        className="flex ml-[2px]"
        activeOpacity={0.7}
        style={{
          backgroundColor: "white",
          borderRadius: 8,
          margin: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <View className="flex-row flex-1">
          <View className="pl-4 py-2 w-[70%] flex flex-1 ">
            <View className="flex flex-row gap-4 mb-[2px] items-center">
              <Ionicons
                name="business"
                size={24}
                color="green"
                className="mr-2"
              />
              <Text className="text-xl capitalize font-bold">
                {item.first_name} {item.last_name}
              </Text>
            </View>
            <View className="flex flex-row gap-4 mb-[2px] items-center">
              <Ionicons
                name="pricetags-outline"
                size={24}
                color="green"
                className="mr-2"
              />
              <Text className="text-base">
                {item.agreed_price} ({item.payment_mode})
              </Text>
            </View>
            <View className="flex flex-row gap-4 mb-[2px] items-center">
              <Ionicons
                name="location"
                size={24}
                color="green"
                className="mr-2"
              />
              <Text className="text-base">{item.location}</Text>
            </View>
            <View className="flex flex-row gap-4 mb-[2px] items-center">
              <Ionicons name="time" size={24} color="green" className="mr-2" />
              <Text className="text-base">{formatDateTime(item.datetime)}</Text>
            </View>
          </View>
          <View className="w-[30%] flex-[0.5] justify-center items-center">
            {statusText == "Pending" && (
              <View className="flex justify-evenly">
                {loadingRequestId == item.request_id &&
                loadingActionType == "accept" ? (
                  <DotIndicator
                    color="green"
                    count={3}
                    size={5}
                    style={{ flexGrow: 0 }}
                  />
                ) : (
                  <TouchableOpacity
                    className="p-2 mt-4 rounded-xl mr-3"
                    style={{ backgroundColor: "green" }}
                    onPress={() => triggerAction(item.request_id, "accept")}
                  >
                    <Text style={{ color: "white" }}>Accept</Text>
                  </TouchableOpacity>
                )}
                {loadingRequestId == item.request_id &&
                loadingActionType == "decline" ? (
                  <DotIndicator
                    color="red"
                    count={3}
                    size={5}
                    style={{ flexGrow: 0, paddingTop: 20 }}
                  />
                ) : (
                  <TouchableOpacity
                    className="p-2 mt-4 rounded-xl mr-3"
                    style={{ backgroundColor: "red" }}
                    onPress={() => triggerAction(item.request_id, "decline")}
                  >
                    <Text style={{ color: "white" }}>Decline</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {statusText == "In Progress" && (
              <View className="flex items-center justify-center">
                {loadingRequestId == item.request_id &&
                loadingActionType == "mark_complete" ? (
                  <DotIndicator
                    color="green"
                    count={3}
                    size={5}
                    style={{ flexGrow: 0 }}
                  />
                ) : (
                  <TouchableOpacity
                    className="p-2 mt-4 rounded-xl mr-3"
                    style={{ backgroundColor: "green" }}
                    onPress={() =>
                      triggerAction(item.request_id, "mark_complete")
                    }
                  >
                    <Text style={{ color: "white" }}>Mark as Complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {(statusText == "Completed" || statusText == "Declined") && (
              <Animatable.View
                className="p-2 rounded-xl mr-3"
                animation="pulse"
                iterationCount="infinite"
                duration={1000}
                style={{
                  backgroundColor: statusColor,
                }}
              >
                <Text style={{ color: textColor }}>{statusText}</Text>
              </Animatable.View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <CustomHeader
        OpenDrawer={() => navigation.openDrawer()}
        showMenuIcon={true}
        updateSearchQuery={updateSearchQuery}
        screen="SPrequest"
      />
      {isRequestsLoading ? (
        <Loader />
      ) : (
        <>
          <View className="flex-row justify-around items-center">
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
              horizontal
              showsHorizontalScrollIndicator={false}
              className="gap-2 mb-2"
            >
              {Object.values(subcategories).map((subcategory) => (
                <TouchableOpacity
                  key={subcategory}
                  className={`px-4 py-2 rounded-xl ${
                    activeSubcategory === subcategory
                      ? "bg-[#22543D]"
                      : "bg-gray-300"
                  }`}
                  onPress={() => filterBySubcategory(subcategory)}
                >
                  <Text
                    className={`text-base font-bold ${
                      activeSubcategory === subcategory
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    {subcategory}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View className="flex flex-row justify-around py-2">
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              horizontal
              showsHorizontalScrollIndicator={false}
              className="gap-2 mb-2"
            >
              {Object.keys(filterConditions).map((filterType) => (
                <TouchableOpacity
                  key={filterType}
                  className={`px-4 py-2 rounded-xl ${
                    activeFilter === filterType ? "bg-green-900" : "bg-gray-300"
                  }`}
                  onPress={() => filterRequests(filterType)}
                >
                  <Text
                    className={`text-base font-semibold ${
                      activeFilter === filterType ? "text-white" : "text-black"
                    }`}
                  >
                    {filterConditions[filterType]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View className="flex-1">
            {filteredRequests && filteredRequests.length > 0 ? (
              <FlatList
                data={filteredRequests}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
              />
            ) : (
              <View className="flex flex-1 justify-center items-center">
                <Text className="text-center text-lg font-bold">
                  No Requests
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default SPActivityScreen;
