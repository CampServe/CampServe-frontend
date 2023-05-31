import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import CustomHeader from "../../components/CustomHeader";

const HelpsAndFaqsScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <CustomHeader GoBack={() => navigation.goBack()} showBackIcon={true} />
      <Text>HelpsAndFaqsScreen</Text>
    </SafeAreaView>
  );
};

export default HelpsAndFaqsScreen;
