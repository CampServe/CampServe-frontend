import React, { useEffect, useState } from "react";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import useOnboardingStatus from "./src/hooks/useOnboardingStatus";
import * as SplashScreen from "expo-splash-screen";

const AppWrapper = ({ children }) => {
  const { loading } = useOnboardingStatus();
  const [appReady, setAppReady] = useState(false);

  // useEffect(() => {
  //   async function prepare() {
  //     await SplashScreen.preventAutoHideAsync();
  //     setAppReady(true);
  //   }

  //   prepare();
  // }, []);

  // useEffect(() => {
  //   if (!loading && appReady) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [loading, appReady]);

  // if (!appReady) {
  //   return null;
  // }

  return (
    <>
      <ExpoStatusBar style="auto" />
      {children}
    </>
  );
};

export default AppWrapper;
