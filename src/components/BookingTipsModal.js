import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";

const BookingTipsModal = ({ isVisible, onClose }) => {
  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.5}
      animationIn="zoomIn"
      animationOut="zoomOut"
      onBackdropPress={onClose}
    >
      <View
        className="bg-white p-6 rounded-md"
        style={{ width: "100%", alignSelf: "center" }}
      >
        <View className="flex flex-col items-center">
          <Text className="text-lg font-semibold mb-4 text-center">
            Tips for Booking Services
          </Text>
          <View className="self-start w-[95%]">
            <View className="flex-row text-base pb-2">
              <Text className="text-base">- </Text>
              <Text className="text-base">
                Ensure the agreed price and mode of payment are clear with the
                service provider before making a booking.
              </Text>
            </View>
            <View className="flex-row pb-2">
              <Text className="text-base">- </Text>
              <Text className="text-base">
                Double-check your location and ensure it is accurately provided
                to the service provider.
              </Text>
            </View>
            <View className="flex-row pb-2">
              <Text className="text-base">- </Text>
              <Text className="text-base">
                Carefully select a scheduled date and time that works for both
                you and the service provider.
              </Text>
            </View>
            <View className="flex-row pb-2">
              <Text className="text-base">- </Text>
              <Text className="text-base">
                Be polite and professional when interacting with the service
                provider.
              </Text>
            </View>
            <View className="flex-row pb-2">
              <Text className="text-base">- </Text>
              <Text className="text-base">
                Make payment only after the service has been provided.
              </Text>
            </View>
          </View>
        </View>

        <View className="flex items-center justify-center">
          <TouchableOpacity
            className="w-32 rounded-md flex items-center p-2 mt-4 bg-green-600"
            onPress={onClose}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default BookingTipsModal;
