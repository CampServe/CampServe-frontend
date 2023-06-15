import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { storeRatings } from "../hooks/useApi";
import { DotIndicator } from "react-native-indicators";

export const calculateAverageRating = (ratings) => {
  if (ratings.length === 0) return 0;

  const totalStars = ratings.reduce((sum, rating) => sum + rating.stars, 0);
  const averageRating = totalStars / ratings.length;
  return Math.round(averageRating * 10) / 10;
};

const RatingsAndReviews = ({ ratings, provider_id }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [displayedReviews, setDisplayedReviews] = useState([]);
  const [isReviewsModalVisible, setIsReviewsModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const addRatingAndReview = () => {
    const newRating = {
      id: user.user_id,
      provider_id: provider_id,
      ratings: selectedRating,
      review: review.trim(),
      timestamp: new Date(),
    };
    setIsLoading(true);

    try {
      const ratingSent = storeRatings(newRating);
      if (ratingSent) {
        console.log("Success");
      } else {
        console.log("Failure");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      closeReview();
    }
  };

  const closeReview = () => {
    setIsReviewsModalVisible(false);
    setSelectedRating(0);
    setReview("");
  };

  const renderStars = () => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      const isSelected = i <= selectedRating;

      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setSelectedRating(i)}
          style={{ marginRight: 5 }}
        >
          <Ionicons
            name={isSelected ? "star" : "star-outline"}
            size={32}
            color={isSelected ? "green" : "gray"}
          />
        </TouchableOpacity>
      );
    }

    return stars;
  };

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
  const maxCount = Math.max(...ratingCounts);

  useEffect(() => {
    const sortedReviews = [...ratings].sort((a, b) => b.stars - a.stars);
    const displayedReviews = sortedReviews.slice(0, 3);
    setDisplayedReviews(displayedReviews);
  }, [ratings]);

  return (
    <>
      <View className="px-4 pt-4">
        <Text className="text-lg font-bold">Ratings and Reviews</Text>
        {displayedReviews.length > 0 ? (
          <View className="bg-white rounded-lg p-4 pb-0">
            <View className="flex-row space-x-10 mb-4">
              <View className="flex justify-between mb-4">
                <View>
                  <Text className="text-2xl font-bold">{averageRating}</Text>
                  <View className="flex flex-row items-center mt-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Ionicons
                        key={index}
                        name={
                          index < Math.floor(averageRating)
                            ? "star"
                            : index - Math.floor(averageRating) < 0.5
                            ? "star-half"
                            : "star-outline"
                        }
                        size={12}
                        color="green"
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
                          width: `${(ratingCounts[index] / maxCount) * 100}%`,
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
                  <Text className="font-semibold">{rating.name}</Text>
                  <View className="flex-row gap-2">
                    <View className="flex flex-row items-center mt-1">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Ionicons
                          key={index}
                          name={index < rating.stars ? "star" : "star-outline"}
                          size={12}
                          color={index < rating.stars ? "green" : "gray"}
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
                    <Text className="text-gray-600 mt-1">
                      No comment provided
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="flex flex-1 my-10 justify-center items-center">
            <Text className="text-gray-600 text-xl">
              No ratings and reviews
            </Text>
          </View>
        )}

        <View className="flex-row justify-between">
          {displayedReviews.length > 0 && (
            <TouchableOpacity
              className="flex items-center justify-center rounded-lg pb-4"
              onPress={() => {
                setIsModalVisible(true);
              }}
            >
              <Text className="text-green-600">See all Reviews</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="flex items-center justify-center rounded-lg pb-4"
            onPress={() => {
              setIsReviewsModalVisible(true);
            }}
          >
            <Text className="text-green-600">Post a review</Text>
          </TouchableOpacity>
        </View>
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
                All Reviews
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
                    <Text className="font-semibold">{rating.name}</Text>
                    <View className="flex-row gap-2">
                      <View className="flex flex-row items-center mt-1">
                        {Array.from({ length: 5 }, (_, index) => (
                          <Ionicons
                            key={index}
                            name={
                              index < rating.stars ? "star" : "star-outline"
                            }
                            size={12}
                            color={index < rating.stars ? "green" : "gray"}
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

      <Modal
        isVisible={isReviewsModalVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        style={{ margin: 0 }}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl px-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl flex-1 text-center font-bold my-5">
                Rate Service Provider
              </Text>
              <TouchableOpacity onPress={closeReview} className="p-4">
                <Ionicons name="close-sharp" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <View className="flex flex-row items-center justify-between mb-4">
              {renderStars()}
            </View>
            <View>
              <Text className="text-base font-semibold mb-1">
                Review (optional):
              </Text>
              <TextInput
                multiline
                value={review}
                onChangeText={(text) => setReview(text)}
                className={`border focus:border-2 border-green-500 rounded-lg px-4 py-2 focus:border-green-700 focus:outline-none`}
              />
            </View>

            <View className="flex items-center justify-center">
              {isLoading ? (
                <View className="flex justify-center items-center py-2 px-4 my-10 h-10">
                  <DotIndicator color="green" count={3} size={10} />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={addRatingAndReview}
                  disabled={selectedRating === 0}
                  className={`${
                    selectedRating === 0 ? "bg-gray-500" : "bg-green-500"
                  }  w-52 text-white py-2 px-4 my-10 rounded-lg`}
                >
                  <Text className="text-center text-lg">Post</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default RatingsAndReviews;
