import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import CustomHeader from "../../components/CustomHeader";
import ChatList from "../../components/ChatList";
import useSearch from "../../hooks/useSearch";

const MessageScreen = () => {
  const navigation = useNavigation();
  const { updateSearchQuery } = useSearch();

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <CustomHeader
        OpenDrawer={() => navigation.openDrawer()}
        showMenuIcon={true}
        updateSearchQuery={updateSearchQuery}
        screen="message"
      />
      <ChatList />
    </SafeAreaView>
  );
};

export default MessageScreen;
