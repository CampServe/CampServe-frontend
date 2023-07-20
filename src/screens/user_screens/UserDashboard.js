import {
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import CustomHeader from "../../components/CustomHeader";
import useAuth from "../../hooks/useAuth";
import { getServiceProviders, visitedProviders } from "../../hooks/useApi";
import Loader from "../../components/Loader";
import useProvider from "../../hooks/useProvider";
import useSearch from "../../hooks/useSearch";
import useSocket from "../../hooks/useSocket";
import ProviderCategories from "../../components/ProviderCategories";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { calculateAverageRating } from "../../components/RatingsandReviews";
import { useRef } from "react";

const UserDashboard = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isOffline } = useSocket();
  const [serviceProviders, setServiceProviders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Room");
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const { setAverageRate } = useProvider();
  const { searchQueries, updateSearchQuery } = useSearch();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clearInput, setclearInput] = useState(false);
  const refreshColours = ["#22543D"];
  const [selectedView, setSelectedView] = useState("all");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const isInitialRender = useRef(true);

  const handleViewToggle = (view) => {
    setSelectedView(view);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getServiceProviders();
        const filteredData = data.filter(
          (provider) => provider.user_id !== user.user_id
        );
        setServiceProviders(filteredData);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingCategory(false);
      }
    };
    setAverageRate(0);
    if (!isOffline) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (!isOffline && !isInitialRender.current) {
      onRefresh();
    } else {
      isInitialRender.current = false;
    }
  }, [isOffline]);

  const onRefresh = async () => {
    setIsRefreshing(true);

    if (!isOffline) {
      try {
        const data = await getServiceProviders();
        const filteredData = data.filter(
          (provider) => provider.user_id !== user.user_id
        );
        setServiceProviders(filteredData);
        setclearInput(true);
      } catch (error) {
        console.log(error);
      } finally {
        setIsRefreshing(false);
        setclearInput(false);
      }
    } else {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (serviceProviders.length > 0) {
      filterProvidersByCategory(selectedCategory);
    } else {
      setSelectedProviders([]);
    }
  }, [
    selectedCategory,
    serviceProviders,
    searchQueries,
    selectedView,
    isRefreshing,
  ]);

  const mainCategories = [
    ...new Set(serviceProviders.map((provider) => provider.main_categories)),
  ];

  const uniqueSubCategories = [
    ...new Set(selectedProviders.map((provider) => provider.sub_categories)),
  ];

  const filterProvidersByCategory = (category) => {
    setSelectedCategory(category);

    let filteredProviders = serviceProviders.filter(
      (provider) => provider.main_categories === category
    );

    const searchQuery = searchQueries["userDashboard"]?.trim().toLowerCase();

    if (searchQuery) {
      filteredProviders = filteredProviders.filter((provider) =>
        provider.business_name.toLowerCase().includes(searchQuery)
      );
    }

    if (selectedView === "all") {
      setSelectedProviders(filteredProviders);
    } else if (selectedView === "highly rated") {
      const highlyRatedProviders = filteredProviders.filter(
        (provider) => provider.no_of_stars.length > 0
      );

      highlyRatedProviders.sort(
        (a, b) =>
          calculateAverageRating(b.no_of_stars) -
          calculateAverageRating(a.no_of_stars)
      );

      setSelectedProviders(highlyRatedProviders);
    } else if (selectedView === "most bookings") {
      const mostbookedProviders = filteredProviders.filter(
        (provider) => provider.request_count !== 0
      );
      mostbookedProviders.sort((a, b) => b.request_count - a.request_count);
      setSelectedProviders(mostbookedProviders);
    } else if (selectedView === "most visited") {
      filteredProviders.sort((a, b) => b.number_of_visits - a.number_of_visits);
      setSelectedProviders(filteredProviders);
    } else {
      setSelectedProviders([]);
    }
  };

  const handleCardPress = (provider) => {
    const data = {
      provider_id: provider.provider_id,
      subcategory: provider.sub_categories,
    };

    visitedProviders(data);

    const image =
      provider.subcategory_image !== null
        ? provider.subcategory_image
        : getImageBySubCategory(provider.sub_categories);
    navigation.navigate("ServiceDetails", {
      provider: {
        image: image,
        ...provider,
      },
    });
  };

  const getImageBySubCategory = (subCategory) => {
    let image;

    switch (subCategory) {
      case "Featured":
        return require("../../../assets/onboarding4.jpg");
      case "Laundry":
        image = require("../../../assets/sub4.jpg");
        break;
      case "Room Decoration":
        image = require("../../../assets/sub6.jpg");
        break;
      case "Academic Tutoring":
        image = require("../../../assets/sub8.jpg");
        break;
      case "Exams Preparation":
        image = require("../../../assets/sub2.jpg");
        break;
      case "UI/UX Design":
        image = require("../../../assets/sub5.jpg");
        break;
      case "Graphic Design":
        image = require("../../../assets/onboarding1.jpg");
        break;
      default:
        return null;
    }

    return image;
  };

  const dropdownOptions = [
    { key: "all", label: "All" },
    { key: "highly rated", label: "Highly Rated" },
    { key: "most bookings", label: "Most Bookings" },
    { key: "most visited", label: "Most Visited" },
  ];

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleOptionPress = (option) => {
    handleViewToggle(option);
    toggleDropdown();
  };

  return (
    <>
      <SafeAreaView className="bg-white px-4 flex-1">
        <CustomHeader
          showMenuIcon={true}
          OpenDrawer={() => navigation.openDrawer()}
          updateSearchQuery={updateSearchQuery}
          screen="userDashboard"
          clearInput={clearInput}
        />
        {loadingCategory ? (
          <Loader />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={refreshColours}
              />
            }
          >
            <View className="flex-row items-center mb-4 mt-1 relative">
              <Text className="text-xl text-[#0A4014] font-bold">
                Browse by
              </Text>
              <Text className="text-xl text-[#0A4014] capitalize font-bold">
                {" "}
                {selectedView}
              </Text>
              <TouchableOpacity
                className="ml-1"
                style={{ flexGrow: 1 }}
                onPress={toggleDropdown}
              >
                <Ionicons
                  name={`${
                    isDropdownVisible
                      ? "chevron-up-outline"
                      : "chevron-down-outline"
                  }`}
                  color="gray"
                  size={20}
                />
              </TouchableOpacity>
            </View>

            {isDropdownVisible && (
              <ScrollView
                className="z-50 absolute top-8 left-0 right-0 bg-white border-2 border-gray-200 rounded-xl"
                style={{ zIndex: 9999 }}
              >
                {dropdownOptions.map((item, index) => (
                  <TouchableOpacity
                    key={item.key}
                    className={`p-2 items-center ${
                      index !== dropdownOptions.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    } ${item.key == selectedView ? "bg-gray-100" : ""}`}
                    onPress={() => handleOptionPress(item.key)}
                    disabled={item.key == selectedView}
                  >
                    <Text
                      className={`text-sm ${
                        item.key == selectedView
                          ? "text-gray-300"
                          : "text-[#0A4014]"
                      } `}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <ProviderCategories
              mainCategories={mainCategories}
              selectedCategory={selectedCategory}
              filterProvidersByCategory={filterProvidersByCategory}
              uniqueSubCategories={uniqueSubCategories}
              selectedProviders={selectedProviders}
              refreshColours={refreshColours}
              isRefreshing={isRefreshing}
              onRefresh={onRefresh}
              getImageBySubCategory={getImageBySubCategory}
              handleCardPress={handleCardPress}
            />
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
};

export default UserDashboard;
