import { View, Text, Image } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";

const ChatHeader = ({ title }) => {
  const navigation = useNavigation();

  return (
    <View className="p-2 flex-row items-center justify-between border-b border-gray-200">
      <View className="flex flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <View className="flex-row">
          <Image
            style={{ width: 30, height: 30, borderRadius: 30, marginRight: 0 }}
            source={{
              uri: "https://thumbs.dreamstime.com/b/user-profile-avatar-icon-134114304.jpg",
            }}
          />
          <Text className="text-2xl capitalize font-bold pl-2">
            {title.length > 20 ? `${title.substring(0, 20)}...` : title}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ChatHeader;
