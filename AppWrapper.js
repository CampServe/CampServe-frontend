import React from "react";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import BottomNavigationBar from "./src/components/BottomNavigationBar";

const AppWrapper = ({ children }) => {
  return (
    <>
      <ExpoStatusBar style="auto" />
      {children}
      {/* <BottomNavigationBar /> */}
    </>
  );
};

export default AppWrapper;
