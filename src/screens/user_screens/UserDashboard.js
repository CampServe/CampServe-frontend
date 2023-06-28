import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CustomHeader from "../../components/CustomHeader";
import useAuth from "../../hooks/useAuth";
import { getServiceProviders } from "../../hooks/useApi";
import CustomCard from "../../components/CustomCard";
import Loader from "../../components/Loader";
import { calculateAverageRating } from "../../components/RatingsandReviews";
import useProvider from "../../hooks/useProvider";

const UserDashboard = () => {
  const navigation = useNavigation();
  const { isLoadingToken, user } = useAuth();
  const [serviceProviders, setServiceProviders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Room");
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const { setAverageRate } = useProvider();

  if (isLoadingToken) {
    return <Loader />;
  }

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
    fetchData();
  }, []);

  useEffect(() => {
    if (serviceProviders.length > 0) {
      filterProvidersByCategory(selectedCategory);
    }
  }, [selectedCategory, serviceProviders]);

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
      const filteredProviders = serviceProviders.filter(
        (provider) => provider.main_categories === category
      );
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
                    transform: [
                      { scale: category === selectedCategory ? 1.05 : 1 },
                    ],
                    transition: "transform 0.2s",
                  }}
                  onPress={() => filterProvidersByCategory(category)}
                  className={`flex-1 items-center justify-center py-2 mb-3 rounded-lg ${
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
                <View key={subCategory} className="pb-6">
                  <Text className="font-bold text-[#0A4014] uppercase text-lg">
                    {subCategory !== "Featured" && subCategory}
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
                          image={
                            filteredProvider.subcategory_image !== null
                              ? filteredProvider.subcategory_image
                              : getImageBySubCategory(
                                  filteredProvider.sub_categories
                                )
                          }
                          businessName={filteredProvider.business_name}
                          bio={filteredProvider.bio}
                          contactNumber={filteredProvider.provider_contact}
                          ratings={calculateAverageRating(
                            filteredProvider.no_of_stars
                          )}
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
