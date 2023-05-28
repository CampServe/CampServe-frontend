import React from "react";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

const AppWrapper = ({ children }) => {
  return (
    <>
      <ExpoStatusBar style="auto" />
      {children}
    </>
  );
};

export default AppWrapper;
