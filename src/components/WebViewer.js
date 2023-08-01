import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";

const WebViewer = ({ url, onClose }) => {
  const handleWebViewNavigation = (event) => {
    const { url } = event;
    // if (url.includes("payment_success")) {
    //   // Payment success, close the WebView
    //   onClose();
    // } else if (url.includes("payment_failure")) {
    //   // Payment failure, close the WebView or display an error message
    //   onClose();
    // }
  };

  return (
    <SafeAreaView className="flex-1 relative">
      <TouchableOpacity
        onPress={onClose}
        style={{
          position: "absolute",
          top: 23,
          right: 20,
          zIndex: 1,
        }}
      >
        <Ionicons name="close" size={24} />
      </TouchableOpacity>
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        onNavigationStateChange={handleWebViewNavigation}
      />
    </SafeAreaView>
  );
};

export default WebViewer;
