import { Ionicons } from "@expo/vector-icons";
import { Text, View, TouchableOpacity, Image } from "react-native";
import { Audio } from "expo-av";
import React, { useState, useEffect } from "react";
import Lightbox from "react-native-lightbox-v2";
import { CameraRoll } from "@react-native-community/cameraroll";

const ReceiverMessage = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  const longPress = async (uri) => {
    try {
      const result = await CameraRoll.save(uri);
      console.log("Image saved to gallery:", result);
    } catch (error) {
      console.log("Failed to save image to gallery:", error);
    }
  };

  const playAudio = async () => {
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
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setPosition(0);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis);
      setPosition(status.positionMillis);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

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
  }, [message?.audio]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = ((time % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSliderPress = (e) => {
    const sliderWidth = e.nativeEvent.layout.width;
    const newPosition = (e.nativeEvent.locationX / sliderWidth) * duration;
    setPosition(newPosition);
    sound.setPositionAsync(newPosition);
  };

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
    <View className="flex-row justify-start">
      {message.messageType === "text" ? (
        <View
          className="bg-white rounded-lg rounded-tl-none px-2 py-3 mx-3 my-1"
          style={{ maxWidth: "80%" }}
        >
          <Text className="text-black text-base">{message.message}</Text>
          <Text className="text-gray-400 text-[10px] self-end">{time}</Text>
        </View>
      ) : message.messageType === "audio" ? (
        <View
          className={`bg-white  rounded-lg rounded-tl-none px-2 py-3 mx-3 my-1`}
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
            <TouchableOpacity
              className="bg-gray-500 h-2 rounded-lg ml-1"
              style={{
                width: "85%",
                height: 8,
                position: "relative",
                overflow: "hidden",
              }}
              onPress={handleSliderPress}
            >
              <View
                className="bg-gray-300 h-full"
                style={{
                  width: `${(position / duration) * 100}%`,
                  position: "absolute",
                }}
              ></View>
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600 text-xs pl-7">
              {isPlaying ? formatTime(position) : formatTime(duration)}
            </Text>
            <Text className="text-gray-400 text-xs">{time}</Text>
          </View>
        </View>
      ) : (
        <Lightbox
          longPressCallback={() => longPress(message.image)}
          underlayColor="white"
          swipeToDismiss={true}
          renderContent={() => (
            <Image
              source={{ uri: message.image }}
              style={{ flex: 1, resizeMode: "cover" }}
            />
          )}
        >
          <React.Fragment>
            <View className="pl-3">
              <Image
                className="rounded-lg"
                source={{ uri: message.image }}
                style={{
                  width: 200,
                  height: 200,
                  marginTop: 4,
                  marginRight: 8,
                }}
              />
              <View className="absolute bottom-1 right-5">
                <Text className="text-white text-xs">{time}</Text>
              </View>
            </View>
          </React.Fragment>
        </Lightbox>
      )}
    </View>
  );
};

export default ReceiverMessage;