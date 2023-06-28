import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { TextInput, TouchableOpacity, View } from "react-native";
import { Image } from "react-native-elements";

const CustomHeader = ({
  showMenuIcon = false,
  showBackIcon = false,
  OpenDrawer,
  GoBack,
}) => {
  const renderLeftIcon = () => {
    if (showMenuIcon) {
      return (
        <TouchableOpacity className="mr-4 " onPress={OpenDrawer}>
          <Feather name="menu" size={24} />
        </TouchableOpacity>
      );
    } else if (showBackIcon) {
      return (
        <TouchableOpacity className="mr-4 " onPress={GoBack}>
          <Feather name="arrow-left" size={24} />
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  };

  const logo = !showBackIcon && showMenuIcon;
  const notification = !showBackIcon && showMenuIcon;

  return (
    <View className="flex-row items-center justify-between py-2 bg-white">
      {renderLeftIcon()}

      <View className="flex-grow justify-center items-center pr-10">
        <Image
          source={require("../../assets/CampServe.png")}
          className="w-24 h-7 rounded-full"
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

export default CustomHeader;
