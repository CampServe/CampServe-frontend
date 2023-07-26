import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";

const EditSettingsModal = ({ visible, onClose }) => {
  return (
    <Modal
      isVisible={visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      style={{ margin: 0 }}
    >
      <View className="flex-1 justify-end">
        <View className="bg-white h-[95%] rounded-t-3xl">
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text className="text-2xl flex-1 text-center font-bold my-5">
              Edit Settings
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 16 }}>
              <Ionicons name="close-sharp" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditSettingsModal;
