import React from "react";
import { View, Text } from "react-native";
import Modal from "react-native-modal";
import * as Animatable from "react-native-animatable";
import { TouchableOpacity } from "react-native";

const BookingModal = ({ visible, status, onClose }) => {
  let modalContent;

  if (status === "request pending") {
    modalContent = (
      <View className="flex justify-center items-center">
        <Animatable.Image
          source={{
            uri: "https://media.istockphoto.com/id/1384432216/vector/hourglass-transaction-and-request-pending-icon-pixel-perfect-editable-stroke-color.jpg?s=612x612&w=0&k=20&c=qklCIG8D4Uw9OguLitnXZXPgc3R0lrnMmVs2__8cYrQ=",
          }}
          className="w-40 h-32 mb-2"
          animation="fadeIn"
          iterationCount="infinite"
        />
        <Text className="text-xl font-bold text-center">
          Request is pending
        </Text>
      </View>
    );
  } else if (status === "accepted but incomplete") {
    modalContent = (
      <View className="flex justify-center items-center">
        <Animatable.Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/5038/5038308.png",
          }}
          className="w-32 h-32 mb-2"
          animation="fadeIn"
          iterationCount="infinite"
        />
        <Text className="text-xl font-bold text-center">
          Request is in progress
        </Text>
      </View>
    );
  } else {
    return null;
  }

  return (
    <Modal
      isVisible={visible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={500}
    >
      <View className="flex-1 justify-center items-center">
        <View className="bg-white p-4 rounded-lg">
          {modalContent}
          <Text className="text-center pt-2 font-semibold text-[15px]">
            Sorry, you cannot book again as you have already booked
          </Text>
          <View className="flex justify-center items-center">
            <TouchableOpacity
              onPress={onClose}
              className="bg-green-500 w-32 items-center px-4 py-2 rounded-lg mt-4"
            >
              <Text style="text-white font-bold text-center">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BookingModal;
