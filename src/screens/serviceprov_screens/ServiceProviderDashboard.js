import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import { useNavigation } from "@react-navigation/native";

const ServiceProviderDashboard = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView className="bg-white px-4 flex-1">
      <CustomHeader
        showMenuIcon={true}
        OpenDrawer={() => navigation.openDrawer()}
      />
    </SafeAreaView>
  );
};

export default ServiceProviderDashboard;
