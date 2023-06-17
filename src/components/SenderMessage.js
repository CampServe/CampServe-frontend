import { View, Text } from "react-native";
import React from "react";

const SenderMessage = ({ message }) => {
  const date = message.timestamp
    ? new Date(
        message.timestamp.seconds * 1000 +
          message.timestamp.nanoseconds / 1000000
      )
    : null;

  const time =
    date !== null
      ? date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <View className="flex-row justify-end">
      <View
        className="bg-blue-500 rounded-lg rounded-tr-none px-4 py-2 ml-auto mr-2 my-1"
        style={{ maxWidth: "80%" }}
      >
        <Text className="text-white text-base">{message.message}</Text>
        <Text className="text-gray-600 text-[10px] self-end">{time}</Text>
      </View>
    </View>
  );
};

export default SenderMessage;
