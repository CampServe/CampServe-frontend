import {
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CustomHeader from "../../components/CustomHeader";
import useAuth from "../../hooks/useAuth";
import { getServiceProviders } from "../../hooks/useApi";
import Loader from "../../components/Loader";
import { Picker } from "@react-native-picker/picker";
import useProvider from "../../hooks/useProvider";
import useSearch from "../../hooks/useSearch";
import useSocket from "../../hooks/useSocket";
import ProviderCategories from "../../components/ProviderCategories";
import { View } from "react-native";

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
  const [selectedView, setSelectedView] = useState("category");

  const handleViewToggle = (view) => {
    setSelectedView(view);
  };

  useFocusEffect(
    React.useCallback(() => {
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
    }, [isOffline])
  );

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
  }, [selectedCategory, serviceProviders, searchQueries]);

  const dummyFeaturedProviders = [
    {
      id: 1,
      business_name: "Featured Provider 1",
      sub_categories: "Featured",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      provider_contact: "1234567890",
    },
    {
      id: 2,
      business_name: "Featured Provider 2",
      sub_categories: "Featured",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      provider_contact: "9876543210",
    },
    {
      id: 3,
      business_name: "Featured Provider 3",
      sub_categories: "Featured",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      provider_contact: "0126543210",
    },
  ];

  const mainCategories = [
    // "Featured",
    ...new Set(serviceProviders.map((provider) => provider.main_categories)),
  ];

  const uniqueSubCategories = [
    ...new Set(selectedProviders.map((provider) => provider.sub_categories)),
  ];

  const filterProvidersByCategory = (category) => {
    setSelectedCategory(category);

    if (category === "Featured") {
      setSelectedProviders(dummyFeaturedProviders);
    } else {
      let filteredProviders = serviceProviders.filter(
        (provider) => provider.main_categories === category
      );

      const searchQuery = searchQueries["userDashboard"]?.trim().toLowerCase();

      if (searchQuery) {
        filteredProviders = filteredProviders.filter((provider) =>
          provider.business_name.toLowerCase().includes(searchQuery)
        );
      }

      setSelectedProviders(filteredProviders);
    }
  };

  const handleCardPress = (provider) => {
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

  const CustomDropdown = ({ selectedView, handleViewToggle }) => {
    const dropdownOptions = [
      { key: "category", label: "Category" },
      { key: "recommendation", label: "Recommendation" },
    ];
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 20, color: "#0A4014", fontWeight: "700" }}>
          Browse By
        </Text>
        <TouchableOpacity
          style={{
            flexGrow: 1,
          }}
          onPress={() =>
            handleViewToggle(
              selectedView === "category" ? "recommendation" : "category"
            )
          }
        >
          <Text style={{ fontSize: 20, color: "#0A4014", fontWeight: "700" }}>
            {" "}
            {selectedView === "category" ? "Category" : "Recommendation"}
          </Text>
        </TouchableOpacity>
      </View>
    );
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
            <CustomDropdown
              selectedView={selectedView}
              handleViewToggle={handleViewToggle}
            />

            {selectedView === "category" ? (
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
            ) : (
              <Text>Placeholder for Browse By Recommendation</Text>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
};

export default UserDashboard;
