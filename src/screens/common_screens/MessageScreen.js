import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import CustomHeader from "../../components/CustomHeader";
import ChatList from "../../components/ChatList";

const MessageScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <CustomHeader
        OpenDrawer={() => navigation.openDrawer()}
        showMenuIcon={true}
      />
      <ChatList />
    </SafeAreaView>
  );
};

export default MessageScreen;
