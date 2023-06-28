import React from "react";
import { View, ImageBackground } from "react-native";

const ScreenWithBackground = ({ children }) => {
  return (
    <ImageBackground
      source={require("../../assets/bgImage.png")}
      style={{ flex: 1, opacity: 0.9 }}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
};

export default ScreenWithBackground;
