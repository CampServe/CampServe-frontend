import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import React, { useState, useEffect } from "react";

export const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0 || ratings[0] == null) return 0;

  const totalStars = ratings.reduce(
    (sum, rating) => sum + (rating.stars || rating),
    0
  );
  const averageRating = totalStars / ratings.length;
  const roundedRating = averageRating.toFixed(1);

  if (roundedRating.endsWith(".0")) {
    return roundedRating;
  } else {
    return parseFloat(roundedRating);
  }
};

const RatingsAndReviews = ({ rating }) => {
  const ratings = rating;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [displayedReviews, setDisplayedReviews] = useState([]);

  const calculateRatingCounts = (ratings) => {
    const ratingCounts = Array.from({ length: 5 }, () => 0);
    ratings.forEach((rating) => {
      const starIndex = Math.floor(rating.stars) - 1;
      ratingCounts[starIndex]++;
    });
    return ratingCounts.reverse();
  };

  const ratingsCount = Array(5).fill(0);
  ratings.forEach((rating) => {
    const starIndex = Math.floor(rating.stars);
    ratingsCount[starIndex]++;
  });

  const averageRating = calculateAverageRating(ratings);
  const ratingCounts = calculateRatingCounts(ratings);

  useEffect(() => {
    const sortedReviews = [...ratings].sort((a, b) => b.stars - a.stars);
    const displayedReviews = sortedReviews.slice(0, 3);
    setDisplayedReviews(displayedReviews);
  }, [ratings]);

  return (
    <>
      <View className="px-4 pt-4">
        <View className="flex-row justify-between">
          <Text className="text-lg font-bold">Ratings and Reviews</Text>
        </View>
        {displayedReviews.length > 0 ? (
          <View className="bg-white rounded-lg p-4 pb-0">
            <View className="flex-row space-x-10 mb-4">
              <View className="flex justify-between mb-4">
                <View>
                  <Text className="text-2xl text-center font-bold">
                    {averageRating}
                  </Text>
                  <View className="flex flex-row items-center mt-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Ionicons
                        key={index}
                        name={
                          index < Math.floor(averageRating)
                            ? "star"
                            : index === Math.floor(averageRating) &&
                              averageRating % 1 !== 0
                            ? "star-half"
                            : "star-outline"
                        }
                        size={12}
                        color="gold"
                        style={{ marginRight: 2 }}
                      />
                    ))}
                  </View>

                  <Text className="text-gray-600">
                    {ratings.length} reviews
                  </Text>
                </View>
              </View>
              <View className="flex-column">
                {Array.from({ length: 5 }, (_, index) => (
                  <View key={index} className="flex-row items-center">
                    <Text className="mr-4">{5 - index}</Text>
                    <View className="bg-gray-300 h-2 w-[70%] mr-8 rounded overflow-hidden">
                      <View
                        className="bg-green-500 h-2"
                        style={{
                          width: `${
                            (ratingCounts[index] / ratings.length) * 100
                          }%`,
                        }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {displayedReviews.map((rating) => (
              <View className="flex flex-row items-start mb-4" key={rating.id}>
                <Image
                  source={{
                    uri: "https://thumbs.dreamstime.com/b/user-profile-avatar-icon-134114304.jpg",
                  }}
                  className="h-10 w-10 rounded-full mr-3"
                />
                <View className="flex flex-grow">
                  <Text className="font-semibold">
                    {rating.first_name} {rating.last_name}
                  </Text>
                  <View className="flex-row gap-2">
                    <View className="flex flex-row items-center mt-1">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Ionicons
                          key={index}
                          name={index < rating.stars ? "star" : "star-outline"}
                          size={12}
                          color={index < rating.stars ? "gold" : "gray"}
                          style={{ marginRight: 2 }}
                        />
                      ))}
                    </View>
                    <Text className="text-gray-400 text-xs">
                      {new Date(rating.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                  {rating.review ? (
                    <Text className="text-gray-600 mt-1">{rating.review}</Text>
                  ) : (
                    <Text className="text-gray-600 text-xs mt-1">
                      No comment provided
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="flex my-10 justify-center items-center">
            <Text className="text-gray-600 text-xl">
              No ratings and reviews
            </Text>
          </View>
        )}

        {displayedReviews.length > 0 &&
          displayedReviews.length < ratings.length && (
            <TouchableOpacity
              className="flex items-center justify-center rounded-lg pb-4"
              onPress={() => {
                setIsModalVisible(true);
              }}
            >
              <Text className="text-green-600">See all Reviews</Text>
            </TouchableOpacity>
          )}
      </View>

      <Modal
        isVisible={isModalVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        style={{ margin: 0 }}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white h-[90%] rounded-t-3xl px-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl flex-1 text-center font-bold my-5">
                {ratings.length} reviews
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="p-4"
              >
                <Ionicons name="close-sharp" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {ratings.map((rating) => (
                <View
                  className="flex flex-row items-start mb-4"
                  key={rating.id}
                >
                  <Image
                    source={{
                      uri: "https://thumbs.dreamstime.com/b/user-profile-avatar-icon-134114304.jpg",
                    }}
                    className="h-10 w-10 rounded-full mr-3"
                  />
                  <View className="flex flex-grow">
                    <Text className="font-semibold">
                      {rating.first_name} {rating.last_name}
                    </Text>
                    <View className="flex-row gap-2">
                      <View className="flex flex-row items-center mt-1">
                        {Array.from({ length: 5 }, (_, index) => (
                          <Ionicons
                            key={index}
                            name={
                              index < rating.stars ? "star" : "star-outline"
                            }
                            size={12}
                            color={index < rating.stars ? "gold" : "gray"}
                            style={{ marginRight: 2 }}
                          />
                        ))}
                      </View>
                      <Text className="text-gray-400 text-xs">
                        {new Date(rating.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                    {rating.review ? (
                      <Text className="text-gray-600 mt-1">
                        {rating.review}
                      </Text>
                    ) : (
                      <Text className="text-gray-600 text-xs mt-2">
                        No comment provided
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default RatingsAndReviews;
