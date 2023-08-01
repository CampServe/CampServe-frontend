import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import {
  getAllProviderTransactions,
  getProviderRequests,
  requestMoney,
} from "../../hooks/SPuseApi";
import useAuth from "../../hooks/useAuth";
import { SafeAreaView } from "react-native-safe-area-context";
import Loader from "../../components/Loader";
import CustomHeader from "../../components/CustomHeader";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";
import { DotIndicator } from "react-native-indicators";
import useSearch from "../../hooks/useSearch";
import useSocket from "../../hooks/useSocket";
import CustomModal from "../../components/CustomModal";

const SPPaymentScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isOffline } = useSocket();
  const { searchQueries, updateSearchQuery } = useSearch();
  const [refreshing, setRefreshing] = useState(false);
  const refreshColours = ["#22543D"];
  const isInitialRender = useRef(true);
  const [isLoading, setIsLoading] = useState(false);
  const [completedReq, setcompletedReq] = useState([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [filteredData, setfilteredData] = useState([]);
  const [inputStates, setInputStates] = useState({});
  const [errorStates, setErrorStates] = useState({});
  const [isLoadingRequest, setIsLoadingRequest] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [payments, setPayments] = useState([]);

  const handleRequestMoney = (requestId) => {
    setInputStates((prevState) => ({
      ...prevState,
      [requestId]: { showTextInput: true, phoneNumber: "" },
    }));
  };

  const handlePostRequest = async (requestId, agreedPrice) => {
    const phoneNumber = inputStates[requestId].phoneNumber;

    if (!validatePhoneNumber(phoneNumber)) {
      setErrorStates((prevState) => ({
        ...prevState,
        [requestId]: "Momo number should be a 10-digit number starting with 0.",
      }));
      setTimeout(() => {
        setErrorStates((prevState) => ({
          ...prevState,
          [requestId]: "",
        }));
      }, 5000);
      return;
    }

    setErrorStates((prevState) => ({
      ...prevState,
      [requestId]: "",
    }));

    setLoadingId(requestId);
    setIsLoadingRequest(true);

    const requestData = {
      request_id: requestId,
      mobile_number: phoneNumber,
    };

    try {
      const response = await requestMoney(requestData);
      if (response) {
        setIsSuccessModalVisible(true);
      } else {
        console.log("Error");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingId(null);
      setIsLoadingRequest(false);
      setInputStates((prevState) => ({
        ...prevState,
        [requestId]: { showTextInput: false },
      }));
    }
  };

  const handleInputChange = (requestId, text) => {
    setInputStates((prevState) => ({
      ...prevState,
      [requestId]: { ...prevState[requestId], phoneNumber: text },
    }));
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneNumberRegex = /^0\d{9}$/;
    return phoneNumberRegex.test(phoneNumber);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchRequestsPromise = getProviderRequests({
          provider_id: user.provider_id,
        });

        const getProviderTransactionsPromise = getAllProviderTransactions({
          provider_id: user.provider_id,
        });

        const [requestsResponse, providerTransactionsResponse] =
          await Promise.all([
            fetchRequestsPromise,
            getProviderTransactionsPromise,
          ]);

        setPayments(providerTransactionsResponse);
        if (requestsResponse) {
          const completedRequests = requestsResponse.all_requests.filter(
            (req) =>
              req.status_acc_dec === "accepted" &&
              req.status_comp_inco === "complete" &&
              req.payment_mode !== "Cash"
          );
          const filteredCompletedRequests = completedRequests.filter((req) => {
            const requestIdExists = providerTransactionsResponse.some(
              (transaction) => transaction.request_id === req.request_id
            );
            return !requestIdExists;
          });

          setcompletedReq(filteredCompletedRequests);
        } else {
          setcompletedReq([]);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (!isOffline && !isSuccessModalVisible) {
      fetchData();
    }
  }, [isSuccessModalVisible]);

  useEffect(() => {
    if (!isOffline && !isInitialRender.current) {
      onRefresh();
    } else {
      isInitialRender.current = false;
    }
  }, [isOffline]);

  const onRefresh = async () => {
    if (!isOffline) {
      try {
        setRefreshing(true);
        const fetchRequestsPromise = getProviderRequests({
          provider_id: user.provider_id,
        });

        const getProviderTransactionsPromise = getAllProviderTransactions({
          provider_id: user.provider_id,
        });

        const [requestsResponse, providerTransactionsResponse] =
          await Promise.all([
            fetchRequestsPromise,
            getProviderTransactionsPromise,
          ]);

        setPayments(providerTransactionsResponse);

        if (requestsResponse) {
          const completedRequests = requestsResponse.all_requests.filter(
            (req) =>
              req.status_acc_dec === "accepted" &&
              req.status_comp_inco === "complete" &&
              req.payment_mode !== "Cash"
          );
          const filteredCompletedRequests = completedRequests.filter((req) => {
            const requestIdExists = providerTransactionsResponse.some(
              (transaction) => transaction.request_id === req.request_id
            );
            return !requestIdExists;
          });

          setcompletedReq(filteredCompletedRequests);
        } else {
          setcompletedReq([]);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    filterByConditions("Payment Request");
  }, [completedReq]);

  useEffect(() => {
    filterByConditions(activeFilter);
  }, [searchQueries]);

  const filterConditions = {
    "Payment Request": "Payment Request",
    Pending: "Pending",
    Paid: "Paid",
  };

  const filterByConditions = (filter) => {
    let filtered = completedReq;

    if (filter === "Payment Request") {
      setfilteredData(filtered);
    } else if (filter === "Pending") {
      filtered = payments.filter((payment) => payment.has_paid === "false");
      setfilteredData(filtered);
    } else if (filter === "Paid") {
      filtered = payments.filter((payment) => payment.has_paid === "true");
      setfilteredData(filtered);
    }

    const searchQuery = searchQueries["SPpayment"]?.trim().toLowerCase();
    if (searchQuery) {
      filtered = filteredData.filter(
        (req) =>
          req.first_name.toLowerCase().includes(searchQuery) ||
          req.last_name.toLowerCase().includes(searchQuery)
      );
    }
    setfilteredData(filtered);
    setActiveFilter(filter);
  };

  const renderItem = ({ item }) => {
    if (activeFilter === "Payment Request") {
      return (
        <View
          className="mx-2 mt-1"
          style={{
            padding: 16,
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
            marginBottom: 16,
            borderRadius: 12,
          }}
        >
          <Text className="text-[11px] ml-9 text-gray-400 font-semibold">
            {item.subcategory}
          </Text>
          <View className="flex-row justify-between">
            <View className="flex-row">
              <Ionicons
                name="person-outline"
                size={20}
                color="gray"
                style={{
                  backgroundColor: "#D1D5DB",
                  borderRadius: 20,
                  padding: 3,
                }}
              />
              <Text className="ml-2 text-lg text-gray-700 font-bold">
                {item.first_name} {item.last_name}
              </Text>
            </View>

            {!inputStates[item.request_id] ||
            !inputStates[item.request_id].showTextInput ? (
              <TouchableOpacity
                onPress={() => handleRequestMoney(item.request_id)}
              >
                <Ionicons name="create-outline" size={22} color="gray" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() =>
                  setInputStates((prevState) => ({
                    ...prevState,
                    [item.request_id]: { showTextInput: false },
                  }))
                }
              >
                <Ionicons name="close-circle-outline" size={22} color="gray" />
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row mt-2">
            <Ionicons
              name="cash"
              size={20}
              color="gray"
              style={{
                backgroundColor: "#D1D5DB",
                borderRadius: 20,
                padding: 3,
              }}
            />
            <Text className="ml-2 text-base text-gray-600">
              {item.agreed_price}
            </Text>
          </View>

          {inputStates[item.request_id] &&
            inputStates[item.request_id].showTextInput && (
              <>
                <TextInput
                  className="border-b my-2 border-gray-500 focus:border-gray-900 mr-2 ml-7 pl-1 rounded-md flex-1 mb-2"
                  value={inputStates[item.request_id]?.phoneNumber || ""}
                  onChangeText={(text) =>
                    handleInputChange(item.request_id, text)
                  }
                  placeholder="Enter your momo number"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {errorStates[item.request_id] && (
                  <Text className="text-red-500 text-[11px] ml-8">
                    {errorStates[item.request_id]}
                  </Text>
                )}

                <View className="flex-row items-center justify-end">
                  {isLoadingRequest && item.request_id === loadingId ? (
                    <View className="justify-end px-4 py-4">
                      <DotIndicator color="green" count={3} size={5} />
                    </View>
                  ) : (
                    <TouchableOpacity
                      className={`justify-center items-center my-2 bg-green-500 p-1 px-4 py-2 rounded-xl`}
                      onPress={() =>
                        handlePostRequest(item.request_id, item.agreed_price)
                      }
                    >
                      <Text className="text-gray-600">Request</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
        </View>
      );
    } else {
      return (
        <View
          className="mx-2 mt-1"
          style={{
            padding: 16,
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
            marginBottom: 16,
            borderRadius: 12,
          }}
        >
          <Text className="text-[11px] ml-9 text-gray-400 font-semibold">
            {item.subcategory}
          </Text>
          <View className="flex-row justify-between">
            <View className="flex-col">
              <View className="flex-row flex-1">
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="gray"
                  style={{
                    backgroundColor: "#D1D5DB",
                    borderRadius: 20,
                    padding: 3,
                  }}
                />
                <Text className="ml-2 text-lg text-gray-700 font-bold">
                  {item.first_name} {item.last_name}
                </Text>
              </View>

              <View className="flex-row mt-2">
                <Ionicons
                  name="cash"
                  size={20}
                  color="gray"
                  style={{
                    backgroundColor: "#D1D5DB",
                    borderRadius: 20,
                    padding: 3,
                  }}
                />
                <Text className="ml-2 text-base text-gray-600">
                  GH¢ {item.amount}0
                </Text>
              </View>
            </View>
            <Animatable.View
              className="p-2 rounded-xl mr-3 h-[36px]"
              animation="pulse"
              iterationCount="infinite"
              duration={1000}
              style={{
                backgroundColor:
                  activeFilter === "Pending" ? "#FFF7AA" : "#A2D9A1",
              }}
            >
              <Text
                style={{
                  color: activeFilter === "Pending" ? "#D1A800" : "#007F00",
                }}
              >
                {activeFilter === "Pending" ? "Pending" : "Paid"}
              </Text>
            </Animatable.View>
          </View>
        </View>
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <CustomHeader
        OpenDrawer={() => navigation.openDrawer()}
        showMenuIcon={true}
        updateSearchQuery={updateSearchQuery}
        screen="SPpayment"
      />
      {isLoading ? (
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
              {Object.values(filterConditions).map((filtered) => (
                <TouchableOpacity
                  key={filtered}
                  className={`px-4 py-2 rounded-xl ${
                    activeFilter === filtered ? "bg-[#22543D]" : "bg-gray-300"
                  }`}
                  onPress={() => filterByConditions(filtered)}
                >
                  <Text
                    className={`text-base font-bold ${
                      activeFilter === filtered ? "text-white" : "text-black"
                    }`}
                  >
                    {filtered}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View className="flex-1">
            {filteredData.length > 0 ? (
              <FlatList
                data={filteredData}
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
                    No Payments
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </>
      )}
      <CustomModal
        isVisible={isSuccessModalVisible}
        onClose={() => setIsSuccessModalVisible(false)}
        title="Payment Request Successful"
        message="Your payment request has being sent to the user."
        buttonText="OK"
        onButtonPress={() => setIsSuccessModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default SPPaymentScreen;
