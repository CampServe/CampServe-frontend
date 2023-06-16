import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FontAwesome, Feather, MaterialIcons } from "@expo/vector-icons";
import RatingsandReviews, {
  calculateAverageRating,
} from "../../components/RatingsandReviews";
import { getRatings } from "../../hooks/useApi";
import Loader from "../../components/Loader";
import useProvider from "../../hooks/useProvider";

const ServiceDetailsScreen = () => {
  const navigation = useNavigation();
  const [ratings, setRatings] = useState([]);
  const [isRatingsLoading, setIsRatingsLoading] = useState(false);
  const route = useRoute();
  const { provider } = route.params;
  const { averageRate } = useProvider();

  const handleGoBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsRatingsLoading(true);
        const response = await getRatings(provider.provider_id);
        if (response.error === "could not retrieve the information") {
          setRatings([]);
        } else if (response.length !== 0) {
          setRatings(response);
        } else {
          setRatings([]);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsRatingsLoading(false);
      }
    };

    fetchData();
  }, []);

  const averageRating =
    averageRate === 0 ? calculateAverageRating(ratings) : averageRate;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="relative">
          <Image source={provider.image} className="h-56 w-full bg-gray-300" />
          <TouchableOpacity
            className="absolute top-4 left-5 p-2"
            onPress={handleGoBack}
          >
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
        </View>
        {isRatingsLoading ? (
          <Loader />
        ) : (
          <>
            <View className="px-4 pt-4">
              <Text className="text-3xl font-bold capitalize">
                {provider.business_name}
              </Text>
              <View className="flex-row items-center mt-2">
                <MaterialIcons name="info-outline" size={20} color="#888" />
                <Text className="text-base ml-2 capitalize">
                  {provider.bio}
                </Text>
              </View>
              <View className="flex-row items-center mt-2">
                <FontAwesome name="star" size={20} color="gold" />
                <Text className="text-base ml-2">{averageRating || "N/A"}</Text>
              </View>
              <View className="flex-row items-center mt-2">
                <Feather name="phone" size={20} color="#888" />
                <Text className="text-base ml-2">
                  {provider.provider_contact}
                </Text>
              </View>
              <View className="px-4 pt-4">
                <Text className=" text-lg font-bold">Description</Text>
                <View className="bg-white rounded-lg p-2">
                  <Text className="text-base text-gray-600">
                    {provider.subcategories_description}
                  </Text>
                </View>
              </View>
            </View>

            <View className="border border-gray-100 m-2 mx-4" />

            <RatingsandReviews
              business_name={provider.business_name}
              rating={ratings}
              provider_id={provider.provider_id}
            />
          </>
        )}
      </ScrollView>

      <View className="flex-row justify-around items-center p-4 border-t border-gray-300">
        <TouchableOpacity className="flex-row items-center bg-green-500 py-2 px-4 rounded-xl">
          <MaterialIcons name="book-online" size={24} color="white" />
          <Text className="text-white font-bold ml-2">Book Services</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-green-500 p-2 rounded-full">
          <FontAwesome name="comments" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ServiceDetailsScreen;
