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
        <TouchableOpacity className="mr-4 mt-2 " onPress={OpenDrawer}>
          <Feather name="menu" size={24} />
        </TouchableOpacity>
      );
    } else if (showBackIcon) {
      return (
        <TouchableOpacity className="mr-4 mt-2 " onPress={GoBack}>
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
      {/* {logo && (
        <Image
          source={require("../../assets/favicon.png")}
          className="w-10 h-10 object-contain"
        />
      )} */}
      {notification && (
        <TouchableOpacity activeOpacity={0.3}>
          <Ionicons name="notifications-outline" size={24} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CustomHeader;
