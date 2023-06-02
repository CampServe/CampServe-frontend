import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";

const CustomModal = ({
  isVisible,
  onClose,
  title,
  message,
  buttonText,
  showbutton = true,
  onButtonPress,
}) => {
  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View className="bg-white p-4 rounded-md items-center justify-center">
        <Text className="text-lg font-bold mb-2">{title}</Text>
        <Text className="text-gray-700 mb-4 capitalize">{message}</Text>
        {showbutton && (
          <TouchableOpacity
            className="bg-green-500 text-white py-2 px-4 rounded-lg w-[70%]"
            onPress={onButtonPress}
          >
            <Text className="text-center text-base text-white">
              {buttonText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

export default CustomModal;
