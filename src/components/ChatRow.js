import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";
import getMatchedUserInfo from "../lib/getMatchedUserInfo";
import { db } from "../utils/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import Loader from "./Loader";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

const ChatRow = ({ matchDetails }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [matchedUserInfo, setMatchedUserInfo] = useState(null);
  const [lastMessage, setLastMessage] = useState("");
  const [lastTime, setlastTime] = useState("");
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    setMatchedUserInfo(getMatchedUserInfo(matchDetails.users, user.user_id));
  }, [matchDetails, user]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = ((time % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  //  try {
  //         const soundObject = new Audio.Sound();
  //         await soundObject.loadAsync({ uri: message.audio });
  //         setSound(soundObject);

  // soundObject.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
  // const status = await soundObject.getStatusAsync();
  //         setDuration(status.durationMillis);
  //       } catch (error) {
  //         console.log("Error loading audio:", error);
  //       }

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "matches", matchDetails.id, "messages"),
          orderBy("timestamp", "desc")
        ),
        async (snapshot) => {
          const messages = snapshot.docs.map((doc) => doc.data());
          // console.log(messages[0]);
          setLastMessage(messages[0]);

          if (messages[0]?.messageType === "audio") {
            const sound = new Audio.Sound();
            try {
              await sound.loadAsync({ uri: messages[0]?.audio });
              const status = await sound.getStatusAsync();
              const duration = status.durationMillis;
              setLastMessage({
                ...messages[0],
                duration: formatTime(duration),
              });
            } catch (error) {
              console.log("Error loading audio file:", error);
            } finally {
              await sound.unloadAsync();
            }
          }
          const date = messages[0]?.timestamp
            ? new Date(
                messages[0]?.timestamp.seconds * 1000 +
                  messages[0]?.timestamp.nanoseconds / 1000000
              )
            : null;

          const time =
            date !== null
              ? date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";
          setlastTime(time);

          const unreadMessages = messages.filter(
            (message) => message.userId !== user.user_id && !message.read
          );
          setUnreadMessageCount(unreadMessages.length);

          setLoadingChats(false);
        }
      ),

    [matchDetails, db, user]
  );

  // console.log(lastMessage.duration);

  const markMessagesAsRead = async () => {
    const messageDocs = await query(
      collection(db, "matches", matchDetails.id, "messages")
    ).get();

    messageDocs.forEach(async (doc) => {
      if (doc.data().userId !== user.user_id && !doc.data().read) {
        const messageRef = doc.ref;
        await updateDoc(messageRef, { read: true });
      }
    });
  };

  const navigateToMessages = () => {
    markMessagesAsRead();
    navigation.navigate("Chat", { matchDetails });
  };

  if (loadingChats) {
    return <Loader />;
  }

  // console.log(lastMessage);

  return (
    <TouchableOpacity
      className="flex-row justify-between items-center"
      style={{
        height: 80,
        position: "relative",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#FFFFFF",
        marginHorizontal: 12,
        marginBottom: 8,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
      }}
      onPress={navigateToMessages}
    >
      <View className="flex-row">
        <Image
          style={{ width: 40, height: 40, borderRadius: 30, marginRight: 12 }}
          source={{
            uri: "https://thumbs.dreamstime.com/b/user-profile-avatar-icon-134114304.jpg",
          }}
        />
        <View className="flex-row justify-between">
          <View>
            <Text
              className="capitalize"
              style={{ fontSize: 16, fontWeight: "bold" }}
            >
              {matchedUserInfo?.business_name ||
              matchedUserInfo?.business_name == "undefined"
                ? matchedUserInfo?.business_name
                : matchedUserInfo?.first_name +
                  " " +
                  matchedUserInfo?.last_name}
            </Text>
            {lastMessage && lastMessage.messageType === "audio" ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="mic" size={16} color="gray" />
                <Text className="text-gray-400 ml-2 text-sm">
                  {lastMessage.duration}
                </Text>
              </View>
            ) : lastMessage && lastMessage.messageType === "image" ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="image" size={16} color="gray" />
                <Text className="text-gray-400 ml-2 text-sm">Photo</Text>
              </View>
            ) : (
              <Text className="text-gray-400 ml-[2px] text-sm">
                {lastMessage && lastMessage.message && lastMessage.length > 28
                  ? `${lastMessage.message.substring(0, 28)}...`
                  : lastMessage.message}
              </Text>
            )}
          </View>
        </View>
      </View>
      {unreadMessageCount > 0 && (
        <View className="rounded-full px-2 py-[2px] mt-6 bg-green-900">
          <Text
            className="text-center"
            style={{ color: "#FFFFFF", fontSize: 12 }}
          >
            {unreadMessageCount}
          </Text>
        </View>
      )}
      <Text
        className="text-[11px]"
        style={{ position: "absolute", top: 20, right: 12 }}
      >
        {lastTime}
      </Text>
    </TouchableOpacity>
  );
};

export default ChatRow;
