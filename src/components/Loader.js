import { ActivityIndicator } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const Loader = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" />
    </SafeAreaView>
  );
};

export default Loader;
