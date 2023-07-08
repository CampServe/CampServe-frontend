import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../../hooks/useAuth";
import { getProviderInfo } from "../../hooks/SPuseApi";

const ServiceProviderDashboard = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        const response = await getProviderInfo(user.provider_id);
        // console.log(JSON.stringify(response, null, 2));
      } catch (error) {}
    };

    fetchProviderData();
  }, []);

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
