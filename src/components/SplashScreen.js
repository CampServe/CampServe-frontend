import React from "react";
import { ImageBackground } from "react-native";

const SplashScreen = () => {
  return (
    <ImageBackground
      source={require("../../assets/white.png")}
      style={{ flex: 1, opacity: 0.9 }}
      resizeMode="cover"
    />
  );
};

export default SplashScreen;
