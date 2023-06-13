import {
  View,
  Text,
  TouchableWithoutFeedback,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import CustomHeader from "../../components/CustomHeader";
import useAuth from "../../hooks/useAuth";
import { getServiceProviders } from "../../hooks/useApi";
import CustomCard from "../../components/CustomCard";
import Loader from "../../components/Loader";

const UserDashboard = () => {
  const navigation = useNavigation();
  const { isLoadingToken } = useAuth();
  const [serviceProviders, setServiceProviders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Featured");
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(true);

  if (isLoadingToken) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getServiceProviders();
        setServiceProviders(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingCategory(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    filterProvidersByCategory(selectedCategory);
  }, [selectedCategory]);

  const dummyFeaturedProviders = [
    {
      id: 1,
      business_name: "Featured Provider 1",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      provider_contact: "1234567890",
    },
    {
      id: 2,
      business_name: "Featured Provider 2",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      provider_contact: "9876543210",
    },
    {
      id: 3,
      business_name: "Featured Provider 3",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      provider_contact: "0126543210",
    },
  ];

  const mainCategories = [
    "Featured",
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
      const filteredProviders = serviceProviders.filter(
        (provider) => provider.main_categories === category
      );
      setSelectedProviders(filteredProviders);
    }
  };
  const handleCardPress = (provider) => {
    console.log(provider);
  };

  const getImageByCategory = (category) => {
    switch (category) {
      case "Featured":
        return require("../../../assets/onboarding4.jpg");
      case "Tutoring":
        return require("../../../assets/onboarding3.jpg");
      case "Room":
        return require("../../../assets/onboarding2.jpg");
      case "Design":
        return require("../../../assets/onboarding1.jpg");
      default:
        return null;
    }
  };

  return (
    <>
      <SafeAreaView className="bg-white px-4 flex-1">
        <CustomHeader
          showMenuIcon={true}
          OpenDrawer={() => navigation.openDrawer()}
        />
        {loadingCategory ? (
          <Loader />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-xl text-[#0A4014] font-bold mb-4">
              Browse By Category
            </Text>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              horizontal
              showsHorizontalScrollIndicator={false}
              className="gap-2 mb-2"
            >
              {mainCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={{
                    width: 120,
                  }}
                  onPress={() => filterProvidersByCategory(category)}
                  className={`flex-1 items-center justify-center py-2 rounded-lg ${
                    category === selectedCategory
                      ? "bg-green-900"
                      : "bg-green-900 opacity-60"
                  }`}
                >
                  <Text className="text-white text-bold text-center text-lg">
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView>
              {uniqueSubCategories.map((subCategory) => (
                <View key={subCategory}>
                  <Text className="font-bold text-[#0A4014] uppercase text-lg">
                    {subCategory}
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex flex-row flex-wrap"
                  >
                    {selectedProviders
                      .filter(
                        (provider) => provider.sub_categories === subCategory
                      )
                      .map((filteredProvider) => (
                        <CustomCard
                          key={filteredProvider.user_id}
                          // image={getImageByCategory(selectedCategory)}
                          businessName={filteredProvider.business_name}
                          bio={filteredProvider.bio}
                          contactNumber={filteredProvider.provider_contact}
                          // ratings={filteredProvider.ratings}
                          onPress={() => handleCardPress(filteredProvider)}
                        />
                      ))}
                  </ScrollView>
                </View>
              ))}
            </ScrollView>
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
};

export default UserDashboard;
