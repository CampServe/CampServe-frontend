import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getAllUserRequests } from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/Loader";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { changeRequestStatus } from "../../hooks/SPuseApi";
import { DotIndicator } from "react-native-indicators";
import useSearch from "../../hooks/useSearch";
import useSocket from "../../hooks/useSocket";
import PostReviewModal from "../../components/PostReview.Modal";

const ActivityScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isOffline } = useSocket();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isRequestsLoading, setisRequestsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");
  const [loadingRequestId, setLoadingRequestId] = useState(null);
  const [loadingActionType, setLoadingActionType] = useState(null);
  const [actionCompleted, setActionCompleted] = useState(true);
  const { searchQueries, updateSearchQuery } = useSearch();
  const [refreshing, setRefreshing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [reviewProps, setReviewProps] = useState([]);
  const refreshColours = ["#22543D"];

  useFocusEffect(
    React.useCallback(() => {
      const fetchRequests = async () => {
        setisRequestsLoading(true);
        const data = {
          user_id: user.user_id,
        };
        try {
          const response = await getAllUserRequests(data);
          if (response.message) {
            setRequests([]);
          } else {
            setRequests(response.all_requests);
          }
        } catch (error) {
          console.log(error);
          setRequests([]);
        } finally {
          setisRequestsLoading(false);
        }
      };
      if (!isOffline) {
        fetchRequests();
      }
    }, [actionCompleted])
  );

  useEffect(() => {
    if (!isOffline) {
      onRefresh();
    }
  }, [isOffline]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (!isOffline) {
      try {
        const data = {
          user_id: user.user_id,
        };
        const response = await getAllUserRequests(data);
        if (response) {
          setRequests(response.all_requests);
        } else {
          setRequests([]);
        }
      } catch (error) {
        console.log(error);
        setRequests([]);
      } finally {
        setRefreshing(false);
      }
    } else {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    filterRequests("All");
  }, [requests]);

  useEffect(() => {
    filterRequests(activeFilter);
  }, [searchQueries]);

  const filterRequests = (filterType) => {
    let filtered = requests;

    if (filterType === "Pending") {
      filtered = requests.filter(
        (req) =>
          req.status_acc_dec === "no action" &&
          req.status_comp_inco === "no action"
      );
    } else if (filterType === "Completed") {
      filtered = requests.filter(
        (req) =>
          req.status_acc_dec === "accepted" &&
          req.status_comp_inco === "complete"
      );
    } else if (filterType === "Declined") {
      filtered = requests.filter(
        (req) =>
          req.status_acc_dec === "declined" &&
          req.status_comp_inco === "no action"
      );
    } else if (filterType === "In Progress") {
      filtered = requests.filter(
        (req) =>
          req.status_acc_dec === "accepted" &&
          req.status_comp_inco === "incomplete"
      );
    }

    const searchQuery = searchQueries["request"]?.trim().toLowerCase();

    if (searchQuery) {
      filtered = filtered.filter((req) =>
        req.business_name.toLowerCase().includes(searchQuery)
      );
    }

    setFilteredRequests(filtered);
    setActiveFilter(filterType);
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

  const triggerCancel = async (requestId, actionType) => {
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
        onPress={() => console.log(item)}
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
              <View className="flex-col-reverse">
                <Text className="text-xl capitalize font-bold">
                  {item.business_name}
                </Text>
                <Text className="text-[11px] font-semibold">
                  {item.subcategory}
                </Text>
              </View>
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
            {statusText === "Pending" &&
              (loadingRequestId === item.request_id &&
              loadingActionType === "cancel" ? (
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
                  onPress={() => triggerCancel(item.request_id, "cancel")}
                >
                  <Text style={{ color: "white" }}>Cancel</Text>
                </TouchableOpacity>
              ))}
            {statusText === "Completed" && (
              <TouchableOpacity
                className="flex pt-2 items-center justify-center rounded-lg"
                onPress={() => {
                  setIsVisible(true);
                  setReviewProps(item);
                }}
              >
                <Text className="text-green-600">Post a review</Text>
              </TouchableOpacity>
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
        screen="request"
      />
      {isRequestsLoading ? (
        <Loader />
      ) : (
        <>
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
            {filteredRequests.length > 0 ? (
              <FlatList
                data={filteredRequests}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={refreshColours}
                  />
                }
              />
            ) : (
              <ScrollView
                contentContainerStyle={{ flex: 1 }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={refreshColours}
                  />
                }
              >
                <View className="flex flex-1 justify-center items-center">
                  <Text className="text-center text-lg font-bold">
                    No Requests
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>

          <PostReviewModal
            isVisible={isVisible}
            onClose={() => setIsVisible(false)}
            businessName={reviewProps?.business_name}
            provider_id={reviewProps?.provider_id}
            sub_categories={reviewProps?.subcategory}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default ActivityScreen;
