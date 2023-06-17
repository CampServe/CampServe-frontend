import { View, Text, Image } from "react-native";
import React from "react";

const ReceiverMessage = ({ message }) => {
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
    <View
      className="bg-white rounded-lg rounded-tl-none px-2 py-3 mx-3 my-1"
      style={{ alignSelf: "flex-start", borderRadius: 16, maxWidth: "80%" }}
    >
      <Text className="text-black text-base">{message.message}</Text>
      <Text className="text-gray-400 text-[10px] self-end">{time}</Text>
    </View>
  );
};

export default ReceiverMessage;
