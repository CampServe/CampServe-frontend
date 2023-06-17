import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatHeader from "../../components/ChatHeader";
import getMatchedUserInfo from "../../lib/getMatchedUserInfo";
import { useRoute } from "@react-navigation/native";
import useAuth from "../../hooks/useAuth";
import SenderMessage from "../../components/SenderMessage";
import ReceiverMessage from "../../components/ReceiverMessage";
import {
  addDoc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import Loader from "../../components/Loader";
import { Ionicons } from "@expo/vector-icons";

const ChatScreen = () => {
  const { user } = useAuth();
  const { params } = useRoute();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [textInputHeight, setTextInputHeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const maxLines = 6;
  const lineHeight = 20;
  const maxTextInputHeight = maxLines * lineHeight;

  const { matchDetails } = params;

  useEffect(() => {
    const checkMatchDetails = async () => {
      try {
        const matchDocRef = doc(db, "matches", matchDetails.id);
        const matchDocSnapshot = await getDoc(matchDocRef);

        if (matchDocSnapshot.exists()) {
        } else {
          await setDoc(matchDocRef, matchDetails);
        }
      } catch (error) {
        console.log("Error checking match details:", error);
      }
    };

    checkMatchDetails();

    const unsubscribe = onSnapshot(
      query(
        collection(db, "matches", matchDetails.id, "messages"),
        orderBy("timestamp", "desc")
      ),
      (snapshot) => {
        const updatedMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const unreadMessages = updatedMessages.filter(
          (message) => !message.read && message.userId !== user.user_id
        );

        if (unreadMessages.length > 0) {
          unreadMessages.forEach((message) => {
            updateDoc(
              doc(db, "matches", matchDetails.id, "messages", message.id),
              {
                read: true,
              }
            );
          });
        }
        setMessages(updatedMessages);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [matchDetails, user.user_id]);

  const handleContentSizeChange = (event) => {
    const { contentSize } = event.nativeEvent;
    const { height } = contentSize;
    setTextInputHeight(Math.min(height, maxTextInputHeight));
  };

  const sendMessage = () => {
    addDoc(collection(db, "matches", matchDetails.id, "messages"), {
      timestamp: serverTimestamp(),
      userId: user.user_id,
      displayName: user.first_name + " " + user.last_name,
      message: input,
      read: false,
    });

    setInput("");
  };

  const matchedUserInfo = getMatchedUserInfo(matchDetails?.users, user.user_id);
  const matchedUserName =
    matchedUserInfo.first_name + " " + matchedUserInfo.last_name;
  const matchedBusinessName = matchedUserInfo.business_name;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ChatHeader
        callEnabled
        title={
          matchedBusinessName || matchedBusinessName == "undefined"
            ? matchedBusinessName
            : matchedUserName
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={10}
      >
        {loading ? (
          <Loader />
        ) : (
          <FlatList
            data={messages}
            inverted={-1}
            style={{ paddingLeft: 4 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item: message }) => {
              return message.userId === user.user_id ? (
                <SenderMessage key={message.id} message={message} />
              ) : (
                <ReceiverMessage key={message.id} message={message} />
              );
            }}
          />
        )}
        <View className="flex-row px-2">
          <View
            className="flex-row flex-1 bg-white justify-between items-center px-5 my-2 mt-2 mx-2 rounded-3xl"
            style={{
              maxHeight: maxTextInputHeight + 16,
              overflow: "hidden",
            }}
          >
            <TextInput
              style={{ lineHeight: lineHeight, height: textInputHeight }}
              className="flex-1 text-lg pr-2 bg-white rounded-3xl py-2 px-4"
              placeholder="Send Message"
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              value={input}
              multiline={true}
              numberOfLines={1}
              onContentSizeChange={handleContentSizeChange}
            />
          </View>
          <TouchableOpacity
            disabled={input.length === 0}
            className={`rounded-full py-2 px-3 self-center ${
              input.length === 0 ? "bg-gray-500" : "bg-green-500"
            }`}
            onPress={sendMessage}
          >
            <Ionicons name="paper-plane" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
