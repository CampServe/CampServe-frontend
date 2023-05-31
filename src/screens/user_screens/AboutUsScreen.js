import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import { useNavigation } from "@react-navigation/native";

const AboutUsScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <CustomHeader GoBack={() => navigation.goBack()} showBackIcon={true} />
      <Text>AboutUsScreen</Text>
    </SafeAreaView>
  );
};

export default AboutUsScreen;
