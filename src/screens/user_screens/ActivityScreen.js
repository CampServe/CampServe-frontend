import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getAllUserRequests } from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/Loader";
import { FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

const ActivityScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isRequestsLoading, setisRequestsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");

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

      fetchRequests();
    }, [])
  );

  useEffect(() => {
    filterRequests("All");
  }, [requests]);

  const filterRequests = (filterType) => {
    if (filterType == "All") {
      setFilteredRequests(requests);
    } else if (filterType == "Pending") {
      const filtered = requests.filter(
        (req) =>
          req.status_acc_dec == "no action" &&
          req.status_comp_inco == "no action"
      );
      setFilteredRequests(filtered);
    } else if (filterType == "Completed") {
      const filtered = requests.filter(
        (req) =>
          req.status_acc_dec == "accepted" && req.status_comp_inco == "complete"
      );
      setFilteredRequests(filtered);
    } else if (filterType == "Declined") {
      const filtered = requests.filter(
        (req) =>
          req.status_acc_dec == "declined" &&
          req.status_comp_inco == "no action"
      );
      setFilteredRequests(filtered);
    } else if (filterType == "In Progress") {
      const filtered = requests.filter(
        (req) =>
          req.status_acc_dec == "accepted" &&
          req.status_comp_inco == "incomplete"
      );
      setFilteredRequests(filtered);
    }
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

  const renderItem = ({ item }) => {
    let statusColor = "gray";
    let statusText = "";

    // if (activeFilter === "All") {
    if (
      item.status_acc_dec == "no action" &&
      item.status_comp_inco == "no action"
    ) {
      statusColor = "blue";
      statusText = "Pending";
    } else if (
      item.status_acc_dec == "accepted" &&
      item.status_comp_inco == "complete"
    ) {
      statusColor = "green";
      statusText = "Completed";
    } else if (
      item.status_acc_dec == "declined" &&
      item.status_comp_inco == "no action"
    ) {
      statusColor = "red";
      statusText = "Declined";
    } else if (
      item.status_acc_dec == "accepted" &&
      item.status_comp_inco == "incomplete"
    ) {
      statusColor = "yellow";
      statusText = "In Progress";
    }
    // }
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
          <View className="pl-4 py-2 w-[70%] flex ">
            <View className="flex flex-row gap-4 mb-[2px] items-center">
              <Ionicons
                name="business"
                size={24}
                color="green"
                className="mr-2"
              />
              <Text className="text-xl capitalize font-bold">
                {item.business_name}
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
          <View className="w-[30%] justify-center items-center">
            {/* {activeFilter === "All" && ( */}
            <Animatable.View
              className="p-2 rounded-xl mr-3"
              animation="pulse"
              iterationCount="infinite"
              duration={1000}
              style={{
                backgroundColor: statusColor,
              }}
            >
              <Text style={{ color: "white" }}>{statusText}</Text>
            </Animatable.View>
            {statusText === "Pending" && (
              <TouchableOpacity
                className="p-2 mt-6 rounded-xl mr-3"
                style={{ backgroundColor: "red" }}
              >
                <Text style={{ color: "white" }}>Cancel</Text>
              </TouchableOpacity>
            )}
            {/* )} */}
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
                    className={`text-base ${
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
              />
            ) : (
              <View className="flex flex-1 justify-center items-center">
                <Text className="text-center text-lg font-bold ">
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

export default ActivityScreen;
