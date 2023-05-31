import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const BottomNavigationBar = () => {
  const [activeTab, setActiveTab] = useState("UserDashboard");
  const navigation = useNavigation();

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    navigation.navigate(tab);
  };

  const tabs = [
    { id: "UserDashboard", icon: "home", name: "Home" },
    { id: "Payment", icon: "credit-card", name: "Payment" },
    { id: "Activity", icon: "local-activity", name: "Activity" },
  ];

  const renderTab = (item) => {
    const isActive = item.id === activeTab;
    return (
      <TouchableOpacity
        activeOpacity={0.4}
        onPress={() => handleTabPress(item.id)}
        className={`flex-1 justify-center items-center py-2 ${
          isActive ? "text-green-600" : "text-black"
        }`}
        key={item.id}
      >
        <MaterialIcons
          name={item.icon}
          size={24}
          color={isActive ? "green" : "black"}
        />
        <Text
          className={`text-xs font-semibold ${
            isActive ? "text-green-600" : "text-black"
          }`}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="fixed rounded-lg bottom-0 h-12 left-0 w-full bg-white border border-gray-200 flex-row">
      {tabs.map(renderTab)}
    </View>
  );
};

export default BottomNavigationBar;
