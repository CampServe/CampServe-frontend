import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FontAwesome, Feather, MaterialIcons } from "@expo/vector-icons";
import RatingsandReviews, {
  calculateAverageRating,
} from "../../components/RatingsandReviews";

const ServiceDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { provider } = route.params;

  const handleGoBack = () => {
    navigation.goBack();
  };

  const ratings = [
    {
      id: 1,
      name: "John Doe",
      stars: 4,
      review: "Great service! Highly recommended.",
      timestamp: "2023-06-15T10:37:06.565Z",
    },
    {
      id: 2,
      name: "Jane Smith",
      stars: 5,
      review: "Excellent work! Very satisfied.",
      timestamp: "2023-06-15T10:37:06.565Z",
    },
    {
      id: 3,
      name: "Jane Smith",
      stars: 5,
      review: "Excellent work! Very satisfied.",
      timestamp: "2023-06-15T10:37:06.565Z",
    },
    {
      id: 4,
      name: "Jane Smith",
      stars: 5,
      review: "Excellent work! Very satisfied.",
      timestamp: "2023-06-15T10:37:06.565Z",
    },
    {
      id: 5,
      name: "Jane Smith",
      stars: 2,
      review: "",
    },
  ];

  const averageRating = calculateAverageRating(ratings);

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
        <View className="px-4 pt-4">
          <Text className="text-3xl font-bold capitalize">
            {provider.business_name}
          </Text>
          <View className="flex-row items-center mt-2">
            <MaterialIcons name="info" size={20} color="#888" />
            <Text className="text-base ml-2 capitalize">{provider.bio}</Text>
          </View>
          <View className="flex-row items-center mt-2">
            <FontAwesome name="star" size={20} color="green" />
            <Text className="text-base ml-2">{averageRating || "N/A"}</Text>
          </View>
          <View className="flex-row items-center mt-2">
            <Feather name="phone" size={20} color="#888" />
            <Text className="text-base ml-2">{provider.provider_contact}</Text>
          </View>
          <View className="px-4 pt-4">
            <Text className=" text-lg font-bold">Description</Text>
            <View className="bg-white rounded-lg shadow p-2">
              <Text className="text-base text-gray-600">
                {provider.subcategories_description}
              </Text>
            </View>
          </View>
        </View>

        <RatingsandReviews ratings={ratings} />
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
