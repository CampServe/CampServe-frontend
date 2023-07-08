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
import useProvider from "../hooks/useProvider";

const ChatRow = ({ matchDetails }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { setNewMessageTrigger } = useProvider();
  const [matchedUserInfo, setMatchedUserInfo] = useState(null);
  const [lastMessage, setLastMessage] = useState("");
  const [lastTime, setLastTime] = useState("");
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [loadingChats, setLoadingChats] = useState(false);

  useEffect(() => {
    setMatchedUserInfo(getMatchedUserInfo(matchDetails.users, user.user_id));
  }, [matchDetails, user]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = ((time % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingChats(true);
      const unsubscribe = onSnapshot(
        query(
          collection(db, "matches", matchDetails.id, "messages"),
          orderBy("timestamp", "desc")
        ),
        async (snapshot) => {
          try {
            const messages = snapshot.docs.map((doc) => doc.data());
            const lastMessage = messages[0];

            if (lastMessage?.messageType === "audio") {
              const sound = new Audio.Sound();
              try {
                await sound.loadAsync({ uri: lastMessage.audio });
                const status = await sound.getStatusAsync();
                const duration = status.durationMillis;
                setLastMessage({
                  ...lastMessage,
                  duration: formatTime(duration),
                });
              } catch (error) {
                console.log("Error loading audio file:", error);
              } finally {
                await sound.unloadAsync();
              }
            } else {
              setLastMessage(lastMessage);
            }

            const now = new Date();
            now.setHours(0, 0, 0, 0);

            const date = lastMessage?.timestamp
              ? new Date(
                  lastMessage?.timestamp.seconds * 1000 +
                    lastMessage?.timestamp.nanoseconds / 1000000
                )
              : null;

            let lastTime = "";

            if (date !== null) {
              const dateOnlyNow = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
              );
              const dateOnly = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
              );

              const diffInDays = Math.floor(
                (dateOnlyNow - dateOnly) / (1000 * 60 * 60 * 24)
              );

              if (diffInDays === 0) {
                lastTime = date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              } else if (diffInDays === 1) {
                lastTime = "Yesterday";
              } else {
                const day = date.getDate();
                const month = date.getMonth() + 1;
                const year = date.getFullYear() % 100;

                lastTime = `${day}/${month}/${year
                  .toString()
                  .padStart(2, "0")}`;
              }
            }

            setLastTime(lastTime);

            const unreadMessages = messages.filter(
              (message) => message.userId !== user.user_id && !message.read
            );
            setUnreadMessageCount(unreadMessages.length);
          } catch (error) {
            console.log("Error fetching messages:", error);
          } finally {
            setLoadingChats(false);
          }
        },
        (error) => {
          console.log("Error subscribing to messages:", error);
        }
      );

      return () => {
        unsubscribe();
      };
    };

    fetchData();
  }, [matchDetails, db, user]);

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
    setNewMessageTrigger(true);
    navigation.navigate("Chat", { matchDetails });
  };

  const renderMessageTicks = () => {
    if (lastMessage) {
      const isSentByUser = lastMessage.userId === user.user_id;

      if (isSentByUser) {
        if (lastMessage.read) {
          return (
            <>
              <Ionicons name="checkmark-done-outline" size={20} color="green" />
            </>
          );
        } else {
          return (
            <>
              <Ionicons name="checkmark-done-outline" size={20} color="gray" />
            </>
          );
        }
      } else {
        return null;
      }
    }
    return null;
  };

  return (
    <>
      {loadingChats ? (
        <Loader />
      ) : (
        <TouchableOpacity
          className="flex-row justify-between items-center border-b border-gray-200 rounded-md"
          style={{
            height: 80,
            position: "relative",
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: "#FFFFFF",
            marginHorizontal: 12,
            marginBottom: 8,
          }}
          onPress={navigateToMessages}
        >
          <View className="flex-row">
            <Image
              style={{
                width: 40,
                height: 40,
                borderRadius: 30,
                marginRight: 12,
              }}
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
                <View className="flex-row">
                  {renderMessageTicks()}
                  {lastMessage && lastMessage.messageType === "audio" ? (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons name="mic" size={16} color="gray" />
                      <Text className="text-gray-400 ml-2 text-sm">
                        {lastMessage.duration}
                      </Text>
                    </View>
                  ) : lastMessage && lastMessage.messageType === "image" ? (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons name="image" size={16} color="gray" />
                      <Text className="text-gray-400 ml-2 text-sm">Photo</Text>
                    </View>
                  ) : (
                    <Text className="text-gray-400 ml-[2px] text-sm">
                      {lastMessage &&
                      lastMessage.message &&
                      lastMessage.length > 28
                        ? `${lastMessage.message.substring(0, 28)}...`
                        : lastMessage.message}
                    </Text>
                  )}
                </View>
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
      )}
    </>
  );
};

export default ChatRow;
