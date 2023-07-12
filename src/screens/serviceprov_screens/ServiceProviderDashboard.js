import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../../hooks/useAuth";
import { getProviderInfo } from "../../hooks/SPuseApi";
import Loader from "../../components/Loader";
import { Ionicons } from "@expo/vector-icons";
import RatingsAndReviews from "../../components/RatingsandReviews";
import { Image } from "react-native";

const ServiceProviderDashboard = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [mainData, setMainData] = useState([]);
  const [subData, setSubData] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [activeSubcategory, setActiveSubcategory] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setisLoading(true);
        const response = await getProviderInfo(user.provider_id);
        const { sub_categories, ...otherData } = response;
        setMainData(otherData);
        setSubData(sub_categories);
      } catch (error) {
        console.log(error);
      } finally {
        setisLoading(false);
      }
    };

    fetchProviderData();
  }, []);

  const subcategories = Object.keys(subData);

  useEffect(() => {
    filterBySubcategory(subcategories[0]);
  }, [subData]);

  const filterBySubcategory = (subcategory) => {
    setActiveSubcategory(subcategory);
    const filteredSubcategory = subData[subcategory] || [];
    setFilteredData(filteredSubcategory);
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

  const imageSource = filteredData.subcategory_image
    ? { uri: `${filteredData.subcategory_image}` }
    : getImageBySubCategory(activeSubcategory);

  return (
    <SafeAreaView className="bg-white px-4 flex-1">
      <CustomHeader
        showMenuIcon={true}
        OpenDrawer={() => navigation.openDrawer()}
      />
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <View className="flex justify-around space-y-2 py-2 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="business-outline" size={24} color="green" />
              <Text className="text-xl font-bold capitalize ml-2">
                {mainData.business_name}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="green"
              />
              <Text className=" capitalize ml-2">{mainData.bio}</Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={24} color="green" />
              <Text className="ml-2">{mainData.contact}</Text>
            </View>
          </View>
          <ScrollView>
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

            <View
              className="flex flex-1 ml-[2px]"
              style={{
                backgroundColor: "white",
                borderRadius: 8,
                margin: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
                height: 250,
              }}
            >
              <View className="h-1/2">
                <Image
                  source={imageSource}
                  style={{
                    flex: 1,
                    width: "100%",
                    height: undefined,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                  resizeMode="contain"
                />
              </View>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
                className="pb-4 px-4"
              >
                <View className="pt-4">
                  <Text className=" text-lg font-bold">Description</Text>
                  <View className="bg-white rounded-lg py-2">
                    <Text className="text-base text-gray-600">
                      {filteredData.description}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            </View>

            <View className="border border-gray-100 m-2 mx-4" />

            {filteredData.rating_details !== undefined && (
              <RatingsAndReviews
                key={activeSubcategory}
                rating={filteredData.rating_details}
                canPostReview={false}
              />
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

export default ServiceProviderDashboard;
