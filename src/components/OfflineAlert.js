import React from "react";
import { View, Text } from "react-native";
import useSocket from "../hooks/useSocket";
import * as Animatable from "react-native-animatable";
import { SafeAreaView } from "react-native-safe-area-context";

const OfflineAlert = () => {
  const { isOffline } = useSocket();

  if (!isOffline) {
    return null;
  }

  return (
    <SafeAreaView
    // style={{
    //   position: "absolute",
    //   top: 20,
    //   left: 0,
    //   right: 0,
    //   zIndex: 9999,
    // }}
    >
      <Animatable.View
        animation="slideInDown"
        style={{ backgroundColor: "#F87171", padding: 8 }}
      >
        <View className="flex-row items-center justify-center">
          <Text className="text-white text-sm">No Internet Connection</Text>
        </View>
      </Animatable.View>
    </SafeAreaView>
  );
};

export default OfflineAlert;
