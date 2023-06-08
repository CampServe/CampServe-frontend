import {
  View,
  Text,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import CustomHeader from "../../components/CustomHeader";
import useAuth from "../../hooks/useAuth";

const UserDashboard = () => {
  const navigation = useNavigation();
  const { isLoadingToken } = useAuth();

  if (isLoadingToken) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

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
