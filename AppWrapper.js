import React, { useEffect, useState } from "react";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

const AppWrapper = ({ children }) => {
  const [fontsLoaded] = useFonts({
    Montserrat: require("./src/fonts/static/Montserrat-Regular.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }

    prepare();
  }, []);

  if (!fontsLoaded) {
    return undefined;
  } else {
    SplashScreen.hideAsync();
  }

  return (
    <>
      <ExpoStatusBar style="auto" />
      {children}
    </>
  );
};

export default AppWrapper;
