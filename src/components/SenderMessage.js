import { Ionicons } from "@expo/vector-icons";
import { Text, View, TouchableOpacity, Image } from "react-native";
import { Audio } from "expo-av";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Lightbox from "react-native-lightbox-v2";
import Slider from "@react-native-community/slider";

const SenderMessage = ({ message, isSending }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [duration, setDuration] = useState(1);
  const [position, setPosition] = useState(0);

  const formatTime = useMemo(() => {
    return (time) => {
      const minutes = Math.floor(time / 60000);
      const seconds = ((time % 60000) / 1000).toFixed(0);
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };
  }, []);

  const playAudio = useCallback(async () => {
    try {
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync({ uri: message.audio });
      setSound(soundObject);

      soundObject.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      await soundObject.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.log("Error playing audio:", error);
    }
  }, [message?.audio]);

  const stopAudio = useCallback(async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setPosition(0);
    }
  }, [sound]);

  const onPlaybackStatusUpdate = useCallback((status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis);
      setPosition(status.positionMillis);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    if (message && message.audio) {
      const loadAudio = async () => {
        try {
          const soundObject = new Audio.Sound();
          await soundObject.loadAsync({ uri: message.audio });
          setSound(soundObject);

          soundObject.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
          const status = await soundObject.getStatusAsync();
          setDuration(status.durationMillis);
        } catch (error) {
          console.log("Error loading audio:", error);
        }
      };

      loadAudio();
    }
  }, [message?.audio, onPlaybackStatusUpdate]);

  const handleSliderValueChange = useCallback(
    (value) => {
      const newPosition = value * duration;
      setPosition(newPosition);
      if (sound) {
        sound.setPositionAsync(newPosition);
      }
    },
    [duration, sound]
  );

  const date = useMemo(() => {
    if (message && message.timestamp) {
      return new Date(
        message.timestamp.seconds * 1000 +
          message.timestamp.nanoseconds / 1000000
      );
    }
    return null;
  }, [message?.timestamp]);

  const time = useMemo(() => {
    if (date !== null) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "";
  }, [date]);

  return (
    <View className="flex-row justify-end">
      {message.messageType === "text" ? (
        <View
          className="bg-[#DCF8C6] rounded-lg rounded-tr-none px-4 py-2 ml-auto mr-2 my-1"
          style={{ maxWidth: "80%" }}
        >
          <Text className="text-gray-800 text-base">{message.message}</Text>
          <Text className="text-gray-400 text-xs self-end">
            {isSending || date == null ? (
              <Ionicons name="time" size={12} color="gray" />
            ) : (
              <View className="flex-row">
                <Text className="text-gray-400 text-xs self-end">{time}</Text>
                {message.read == true ? (
                  <Ionicons
                    name="checkmark-done-outline"
                    size={20}
                    color="green"
                  />
                ) : (
                  <Ionicons
                    name="checkmark-done-outline"
                    size={20}
                    color="gray"
                  />
                )}
              </View>
            )}
          </Text>
        </View>
      ) : message.messageType === "audio" ? (
        <View
          className={`bg-[#DCF8C6] rounded-lg rounded-tr-none px-4 py-2 ml-auto mr-2 my-1`}
          style={{ width: "60%", overflow: "hidden" }}
        >
          <View className="flex-row items-center">
            <TouchableOpacity onPress={isPlaying ? stopAudio : playAudio}>
              <Ionicons
                name={isPlaying ? "ios-pause" : "ios-play"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
            <Slider
              style={{
                flex: 1,
              }}
              minimumValue={0}
              maximumValue={1}
              value={position / duration}
              onValueChange={handleSliderValueChange}
            />
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600 text-xs pl-7">
              {!isSending &&
                (isPlaying ? formatTime(position) : formatTime(duration))}
            </Text>
            <Text className="text-gray-400 text-xs">
              {isSending || date == null ? (
                <Ionicons name="time" size={12} color="gray" />
              ) : (
                <View className="flex-row">
                  <Text className="text-gray-400 text-xs self-end">{time}</Text>
                  {message.read == true ? (
                    <Ionicons
                      name="checkmark-done-outline"
                      size={20}
                      color="green"
                    />
                  ) : (
                    <Ionicons
                      name="checkmark-done-outline"
                      size={20}
                      color="gray"
                    />
                  )}
                </View>
              )}
            </Text>
          </View>
        </View>
      ) : (
        <Lightbox
          underlayColor="white"
          swipeToDismiss={true}
          springConfig={{ tension: 100, friction: 10 }}
          renderContent={() => (
            <Image
              source={{ uri: message.image }}
              style={{ flex: 1, resizeMode: "contain" }}
            />
          )}
        >
          <React.Fragment>
            <Image
              className="rounded-lg"
              source={{ uri: message.image }}
              style={{
                width: 200,
                height: 200,
                marginTop: 4,
                marginRight: 8,
              }}
              resizeMode={`${
                message.resizeMode === "cover" ? "cover" : "contain"
              }`}
            />
            <View className="absolute bottom-1 right-5">
              <Text className="text-gray-500 text-xs">
                {isSending || date == null ? (
                  <Ionicons name="time" size={12} color="gray" />
                ) : (
                  <View className="flex-row">
                    <Text className="text-gray-500 text-xs self-end">
                      {time}
                    </Text>
                    {message.read == true ? (
                      <Ionicons
                        name="checkmark-done-outline"
                        size={20}
                        color="green"
                      />
                    ) : (
                      <Ionicons
                        name="checkmark-done-outline"
                        size={20}
                        color="gray"
                      />
                    )}
                  </View>
                )}
              </Text>
            </View>
          </React.Fragment>
        </Lightbox>
      )}
    </View>
  );
};

export default SenderMessage;
