import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DotIndicator } from "react-native-indicators";
import Modal from "react-native-modal";
import useAuth from "../hooks/useAuth";
import useProvider from "../hooks/useProvider";
import { getRatings, storeRatings } from "../hooks/useApi";
import { calculateAverageRating } from "./RatingsandReviews";

const PostReviewModal = ({
  isVisible,
  onClose,
  businessName,
  provider_id,
  sub_categories,
}) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { setAverageRate } = useProvider();

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
            color={isSelected ? "gold" : "gray"}
          />
        </TouchableOpacity>
      );
    }

    return stars;
  };

  const addRatingAndReview = async () => {
    const newRating = {
      id: user.user_id,
      provider_id: provider_id,
      ratings: selectedRating,
      review: review.trim(),
      timestamp: new Date(),
      subcategory: sub_categories,
    };

    const data = {
      provider_id: provider_id,
      subcategory: sub_categories,
    };

    setIsLoading(true);

    try {
      const ratingSent = await storeRatings(newRating);
      if (ratingSent) {
        const newRatings = await getRatings(data);
        setAverageRate(calculateAverageRating(newRatings));
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
    setSelectedRating(0);
    setReview("");
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onBackdropPress={onClose}
      backdropOpacity={0.5}
      style={{ margin: 0 }}
    >
      <View className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl px-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl flex-1 text-center font-bold my-5 capitalize">
              Rate {businessName}
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
  );
};

export default PostReviewModal;
