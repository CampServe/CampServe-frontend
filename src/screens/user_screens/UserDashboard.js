import { View, Text, TouchableWithoutFeedback } from "react-native";
import React, { useLayoutEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import CustomHeader from "../../components/CustomHeader";

const UserDashboard = () => {
  const navigation = useNavigation();

  return (
    <>
      <SafeAreaView className="bg-white px-4 flex-1">
        <CustomHeader
          showMenuIcon={true}
          OpenDrawer={() => navigation.openDrawer()}
        />
      </SafeAreaView>
    </>
  );
};

export default UserDashboard;
