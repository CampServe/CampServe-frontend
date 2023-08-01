import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { getAllUserTransactions } from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import { SafeAreaView } from "react-native-safe-area-context";
import Loader from "../../components/Loader";
import CustomHeader from "../../components/CustomHeader";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";
import useSearch from "../../hooks/useSearch";
import useSocket from "../../hooks/useSocket";
import WebViewer from "../../components/WebViewer";

const PaymentScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isOffline } = useSocket();
  const { searchQueries, updateSearchQuery } = useSearch();
  const [refreshing, setRefreshing] = useState(false);
  const refreshColours = ["#22543D"];
  const isInitialRender = useRef(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");
  const [filteredData, setfilteredData] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getAllUserTransactions({
          user_id: user.user_id,
        });
        setPayments(response);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (!isOffline && !isWebViewVisible) {
      fetchData();
    }
  }, [isWebViewVisible]);

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
        setIsLoading(true);
        const response = await getAllUserTransactions({
          user_id: user.user_id,
        });
        setPayments(response);
      } catch (error) {
        console.log(error);
      } finally {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    filterByConditions("Payment Incoming");
  }, [payments]);

  useEffect(() => {
    filterByConditions(activeFilter);
  }, [searchQueries]);

  const filterConditions = {
    "Payment Incoming": "Payment Incoming",
    Paid: "Paid",
  };

  const filterByConditions = (filter) => {
    let filtered = payments;

    if (filter === "Payment Incoming") {
      filtered = filtered.filter((payment) => payment.has_paid === "false");
    } else if (filter === "Paid") {
      filtered = filtered.filter((payment) => payment.has_paid === "true");
    }

    const searchQuery = searchQueries["payment"]?.trim().toLowerCase();
    if (searchQuery) {
      filtered = filteredData.filter((req) =>
        req.provider_business_name.toLowerCase().includes(searchQuery)
      );
    }
    setfilteredData(filtered);
    setActiveFilter(filter);
  };

  const handlePayPress = (paylink) => {
    setIsWebViewVisible(true);
    setWebViewUrl(paylink);
  };

  const handleWebViewClose = () => {
    setIsWebViewVisible(false);
    setWebViewUrl("");
  };

  const renderItem = ({ item }) => {
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
                {item.provider_business_name}
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
          {activeFilter === "Payment Incoming" ? (
            <TouchableOpacity
              onPress={() => handlePayPress(item.paylink)}
              className="p-3 rounded-xl h-[44px] w-[50px] mr-4 bg-green-500"
            >
              <Text className="text-gray-600">Pay</Text>
            </TouchableOpacity>
          ) : (
            <Animatable.View
              className="p-2 rounded-xl mr-3 h-[36px]"
              animation="pulse"
              iterationCount="infinite"
              duration={1000}
              style={{
                backgroundColor: "#A2D9A1",
              }}
            >
              <Text
                style={{
                  color: "#007F00",
                }}
              >
                Paid
              </Text>
            </Animatable.View>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      {!isWebViewVisible ? (
        <SafeAreaView className="flex-1 bg-white px-4">
          <CustomHeader
            OpenDrawer={() => navigation.openDrawer()}
            showMenuIcon={true}
            updateSearchQuery={updateSearchQuery}
            screen="payment"
          />
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <View className="flex-row justify-around items-center">
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "center",
                  }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="gap-2 mb-2"
                >
                  {Object.values(filterConditions).map((filtered) => (
                    <TouchableOpacity
                      key={filtered}
                      className={`px-4 py-2 rounded-xl ${
                        activeFilter === filtered
                          ? "bg-[#22543D]"
                          : "bg-gray-300"
                      }`}
                      onPress={() => filterByConditions(filtered)}
                    >
                      <Text
                        className={`text-base font-bold ${
                          activeFilter === filtered
                            ? "text-white"
                            : "text-black"
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
        </SafeAreaView>
      ) : (
        <WebViewer url={webViewUrl} onClose={handleWebViewClose} />
      )}
    </>
  );
};

export default PaymentScreen;
