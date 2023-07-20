import React, { useEffect, useState } from "react";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { setCustomText } from "react-native-global-props";
import * as Font from "expo-font";

const AppWrapper = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        Mont: require("./src/fonts/static/Montserrat-Regular.ttf"),
      });

      setFontsLoaded(true);
    }

    loadFonts();
  }, []);

  // useEffect(() => {
  //   if (fontsLoaded) {
  //     const customTextProps = {
  //       style: {
  //         fontFamily: "Mont",
  //       },
  //     };
  //     setCustomText(customTextProps);
  //   }
  // }, [fontsLoaded]);

  return (
    <>
      <ExpoStatusBar style="auto" />
      {children}
    </>
  );
};

export default AppWrapper;
