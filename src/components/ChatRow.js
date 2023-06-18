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

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "matches", matchDetails.id, "messages"),
          orderBy("timestamp", "desc")
        ),
        (snapshot) => {
          const messages = snapshot.docs.map((doc) => doc.data());
          setLastMessage(messages[0]?.message);
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
            <Text style={{ color: "#888" }}>
              {lastMessage && lastMessage.length > 28
                ? `${lastMessage.substring(0, 28)}...`
                : lastMessage}
            </Text>
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
