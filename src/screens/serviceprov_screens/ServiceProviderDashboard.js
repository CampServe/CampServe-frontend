import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../../hooks/useAuth";
import { getProviderInfo } from "../../hooks/SPuseApi";

const ServiceProviderDashboard = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [activeSubcategory, setActiveSubcategory] = useState("");

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        const response = await getProviderInfo(user.provider_id);
        // console.log(JSON.stringify(response, null, 2));
      } catch (error) {}
    };

    fetchProviderData();
  }, []);

  useEffect(() => {
    filterBySubcategory(user.subcategories[0]);
  }, []);

  const filterBySubcategory = (subcategory) => {
    setActiveSubcategory(subcategory);
  };

  return (
    <SafeAreaView className="bg-white px-4 flex-1">
      <CustomHeader
        showMenuIcon={true}
        OpenDrawer={() => navigation.openDrawer()}
      />
      <View className="flex-row justify-around items-center">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="gap-2 mb-2"
        >
          {Object.values(user.subcategories).map((subcategory) => (
            <TouchableOpacity
              key={subcategory}
              className={`px-4 py-2 rounded-xl ${
                activeSubcategory === subcategory
                  ? "bg-[#22543D]"
                  : "bg-gray-300"
              }`}
              onPress={() => filterBySubcategory(subcategory)}
            >
              <Text
                className={`text-base font-bold ${
                  activeSubcategory === subcategory
                    ? "text-white"
                    : "text-black"
                }`}
              >
                {subcategory}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ServiceProviderDashboard;
