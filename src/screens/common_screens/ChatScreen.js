import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TouchableOpacity,
  PanResponder,
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
import { Audio } from "expo-av";
import * as Animatable from "react-native-animatable";
import * as ImagePicker from "expo-image-picker";

const ChatScreen = () => {
  const { user } = useAuth();
  const { params } = useRoute();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [textInputHeight, setTextInputHeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimerInterval, setRecordingTimerInterval] = useState(null);
  const [slidePosition, setSlidePosition] = useState(0);
  const [isBlinking, setIsBlinking] = useState(true);
  const maxLines = 6;
  const lineHeight = 20;
  const maxTextInputHeight = maxLines * lineHeight;

  const { matchDetails } = params;

  const pressTimer = useRef(null);
  const slidePositionRef = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        slidePositionRef.current = gestureState.dx;
        setSlidePosition(gestureState.dx);
      },
      onPanResponderRelease: () => {
        if (slidePositionRef.current < -100) {
          cancelRecording();
        }
        slidePositionRef.current = 0;
        setSlidePosition(0);
      },
    })
  ).current;

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
  }, [matchDetails]);

  const handleContentSizeChange = (event) => {
    const { contentSize } = event.nativeEvent;
    const { height } = contentSize;
    setTextInputHeight(Math.min(height, maxTextInputHeight));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission denied");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const { uri } = result.assets[0];
      sendMessage("image", uri);
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );

        setRecording(recording);
        setIsRecording(true);
        startRecordingTimer();
      } else {
        console.log("Permission refused");
      }
    } catch (error) {
      console.log("Error starting recording:", error);
    }
  };

  const stopRecording = async () => {
    try {
      clearInterval(pressTimer.current);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      setIsRecording(false);
      setRecording(null);

      clearInterval(recordingTimerInterval);

      if (uri && uri.length > 0) {
        sendMessage("audio", uri);
      } else {
        resetRecordingTimer();
      }
    } catch (error) {
      console.log("Error stopping recording:", error);
    } finally {
      resetRecordingTimer();
    }
  };

  const startRecordingTimer = () => {
    const timerInterval = setInterval(() => {
      setRecordingDuration((prevDuration) => prevDuration + 1);
    }, 1000);

    setRecordingTimerInterval(timerInterval);
  };

  const resetRecordingTimer = () => {
    setRecordingDuration(0);
    clearInterval(recordingTimerInterval);
  };

  useEffect(() => {
    return () => {
      clearInterval(recordingTimerInterval);
    };
  }, []);

  const cancelRecording = async () => {
    if (recording) {
      console.log("cancelled");
      try {
        await recording.stopAndUnloadAsync();
        setIsRecording(false);
        setRecording(null);
      } catch (error) {
        console.log("Error canceling recording:", error);
      }
    }
  };

  const sendMessage = (messageType, messageContent) => {
    const message = {
      timestamp: serverTimestamp(),
      userId: user.user_id,
      displayName: user.first_name + " " + user.last_name,
      read: false,
    };

    if (messageType === "text") {
      message.messageType = "text";
      message.message = messageContent;
    } else if (messageType === "audio") {
      message.messageType = "audio";
      message.audio = messageContent;
    } else if (messageType === "image") {
      message.messageType = "image";
      message.image = messageContent;
    }

    addDoc(collection(db, "matches", matchDetails.id, "messages"), message);
    // console.log(message);
    setInput("");
  };

  const formatTime = (durationInSeconds) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;

    const formattedMinutes = minutes < 10 ? `${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    if (minutes > 9 && formattedMinutes !== "00") {
      return `0${formattedMinutes}:${formattedSeconds}`;
    } else {
      return `${formattedMinutes}:${formattedSeconds}`;
    }
  };

  const matchedUserInfo = getMatchedUserInfo(matchDetails?.users, user.user_id);
  const matchedUserName =
    matchedUserInfo.first_name + " " + matchedUserInfo.last_name;
  const matchedBusinessName = matchedUserInfo.business_name;

  const renderMessageItem = (message, index) => {
    if (!message.timestamp || message.timestamp === null) {
      return null;
    }

    const messageDate = message.timestamp.toDate().toDateString();

    const isFirstMessageOfDay =
      index === messages.length - 1 ||
      messageDate !== messages[index + 1].timestamp.toDate().toDateString();

    return (
      <>
        {message.userId === user.user_id ? (
          <SenderMessage
            key={message.id}
            message={message}
            isSending={isSending}
          />
        ) : (
          <ReceiverMessage key={message.id} message={message} />
        )}
        {isFirstMessageOfDay && (
          <View className="items-center py-4">
            <Text className="text-xs">{messageDate}</Text>
          </View>
        )}
      </>
    );
  };

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking((prevIsBlinking) => !prevIsBlinking);
    }, 700);

    return () => {
      clearInterval(blinkInterval);
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ChatHeader
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
            renderItem={({ item, index }) => renderMessageItem(item, index)}
          />
        )}
        <View className="flex-row px-2">
          <View
            className="flex-row flex-1 bg-white justify-between items-center px-5 my-2 mt-2 mx-2 rounded-3xl"
            style={{
              overflow: "hidden",
            }}
          >
            {isRecording ? (
              <TouchableOpacity className="flex-1 my-[2px] flex-row text-lg pr-2 bg-white rounded-3xl py-2 px-4">
                <Animatable.View
                  animation={isBlinking ? "fadeIn" : "fadeOut"}
                  duration={500}
                  style={{
                    transitionProperty: "opacity",
                    transitionDuration: "500ms",
                    opacity: isBlinking ? 1 : 0.5,
                  }}
                >
                  <Ionicons name="mic" size={24} color="red" />
                </Animatable.View>
                <Text className="text-base ml-2">
                  {formatTime(recordingDuration)}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TextInput
                  style={{ maxHeight: maxTextInputHeight }}
                  className="flex-1 text-lg pr-2 bg-white rounded-3xl py-2 px-4"
                  placeholder="Send Message"
                  onChangeText={setInput}
                  value={input}
                  multiline={true}
                  numberOfLines={1}
                  onContentSizeChange={handleContentSizeChange}
                />
                <TouchableOpacity onPress={pickImage}>
                  <Ionicons name="attach" size={24} />
                </TouchableOpacity>
              </>
            )}
          </View>
          <TouchableOpacity
            style={{
              transform: [{ translateX: slidePosition }],
            }}
            className={`rounded-full py-2 px-3 self-center bg-green-500`}
            onPressIn={() => {
              if (input.length === 0) {
                startRecording();
              }
            }}
            onPressOut={() => {
              if (input.length === 0) {
                stopRecording();
              }
            }}
            onPress={() => {
              if (input.length !== 0) {
                sendMessage("text", input);
              }
            }}
            {...panResponder.panHandlers}
          >
            {input.length === 0 ? (
              <Ionicons name="mic" size={24} color="#FFFFFF" />
            ) : (
              <Ionicons name="paper-plane" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
