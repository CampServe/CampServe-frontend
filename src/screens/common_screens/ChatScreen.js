import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TouchableOpacity,
  Animated,
  Alert,
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
import { db, storage } from "../../utils/firebase";
import Loader from "../../components/Loader";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Animatable from "react-native-animatable";
import * as ImagePicker from "expo-image-picker";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import useProvider from "../../hooks/useProvider";

const ChatScreen = () => {
  const { user } = useAuth();
  const { setNewMessageTrigger } = useProvider();
  const { params } = useRoute();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [textInputHeight, setTextInputHeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimerInterval, setRecordingTimerInterval] = useState(null);
  const [isBlinking, setIsBlinking] = useState(true);
  const maxLines = 6;
  const lineHeight = 20;
  const maxTextInputHeight = maxLines * lineHeight;
  const sendButtonOpacity = useRef(new Animated.Value(0)).current;
  const micButtonOpacity = useRef(new Animated.Value(1)).current;

  const { matchDetails } = params;

  const pressTimer = useRef(null);
  const inputRef = useRef(null);

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

    if (matchDetails) {
      checkMatchDetails();
    }

    const unsubscribe = onSnapshot(
      query(
        collection(db, "matches", matchDetails.id, "messages"),
        orderBy("timestamp", "desc")
      ),
      async (snapshot) => {
        try {
          const updatedMessages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const unreadMessages = updatedMessages.filter(
            (message) => !message.read && message.userId !== user.user_id
          );

          if (unreadMessages.length > 0) {
            await Promise.all(
              unreadMessages.map((message) =>
                updateDoc(
                  doc(db, "matches", matchDetails.id, "messages", message.id),
                  {
                    read: true,
                  }
                )
              )
            );
          }

          setMessages(updatedMessages);
        } catch (error) {
          console.error("Error updating messages:", error);
        } finally {
          setLoading(false);
        }
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

    const showOptions = () => {
      const options = [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: handleCameraOption },
        { text: "Choose from Media", onPress: handleMediaOption },
      ];

      Alert.alert("Send Image", "Choose an option", options);
    };

    const handleMediaOption = async () => {
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
        allowsMultipleSelection: true,
      };

      const result = await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets.length > 0) {
        const selectedImages = result.assets;

        const confirmationOptions = [
          { text: "Cancel", style: "cancel" },
          {
            text: "Send",
            onPress: () => handleSendImages(selectedImages),
          },
        ];

        Alert.alert(
          "Send Images",
          `Are you sure you want to send ${selectedImages.length} image(s)?`,
          confirmationOptions
        );
      }
    };

    const handleCameraOption = async () => {
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      };

      const result = await ImagePicker.launchCameraAsync(options);

      if (!result.canceled && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        const confirmationOptions = [
          { text: "Cancel", style: "cancel" },
          {
            text: "Send",
            onPress: () => handleSendImage(selectedImage),
          },
        ];

        Alert.alert(
          "Send Image",
          "Are you sure you want to send this image?",
          confirmationOptions
        );
      }
    };

    const handleSendImages = async (images) => {
      const newMessages = images.map((image) => {
        const { uri } = image;

        const newMessage = {
          id: Math.floor(Math.random() * 1000000000).toString(),
          timestamp: serverTimestamp(),
          userId: user.user_id,
          displayName: user.first_name + " " + user.last_name,
          read: false,
          date: new Date().toDateString(),
          messageType: "image",
          image: uri,
          isSending: true,
          resizeMode: "contain",
        };

        setMessages((prevMessages) => [newMessage, ...prevMessages]);

        return newMessage;
      });

      for (let i = 0; i < newMessages.length; i++) {
        const message = newMessages[i];
        const { uri } = images[i];
        const filename = uri.split("/").pop();
        const response = await fetch(uri);
        const blob = await response.blob();

        const imageName = filename;
        const imageRef = ref(storage, imageName);
        const uploadTask = uploadBytes(imageRef, blob);

        try {
          await uploadTask;
          const downloadURL = await getDownloadURL(imageRef);
          await sendMessage(message.messageType, downloadURL, "contain");
        } catch (error) {
          console.log("Upload failed:", error);
        }
      }
    };

    const handleSendImage = async (image) => {
      const { uri } = image;
      const filename = uri.split("/").pop();

      const newMessage = {
        id: Math.floor(Math.random() * 1000000000).toString(),
        timestamp: serverTimestamp(),
        userId: user.user_id,
        displayName: user.first_name + " " + user.last_name,
        read: false,
        date: new Date().toDateString(),
        messageType: "image",
        image: uri,
        isSending: true,
        resizeMode: "cover",
      };

      setMessages((prevMessages) => [newMessage, ...prevMessages]);

      const response = await fetch(uri);
      const blob = await response.blob();

      const imageName = filename;
      const imageRef = ref(storage, imageName);
      const uploadTask = uploadBytes(imageRef, blob);

      try {
        await uploadTask;
        const downloadURL = await getDownloadURL(imageRef);
        sendMessage("image", downloadURL, "cover");
      } catch (error) {
        console.log("Upload failed:", error);
      }
    };

    showOptions();
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
      try {
        await recording.stopAndUnloadAsync();
        setIsRecording(false);
        setRecording(null);
        clearInterval(pressTimer.current);
        resetRecordingTimer();
      } catch (error) {
        console.log("Error canceling recording:", error);
      }
    }
  };

  const sendMessage = async (messageType, messageContent, resizeMode) => {
    const message = {
      timestamp: serverTimestamp(),
      userId: user.user_id,
      displayName: user.first_name + " " + user.last_name,
      read: false,
      date: new Date().toDateString(),
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
      message.resizeMode = resizeMode;
    }

    const id = Math.floor(Math.random() * 1000000000).toString();

    const newMessage = { ...message, id, isSending: true };

    setMessages((prevMessages) => {
      if (messageType === "image") {
        return prevMessages;
      }
      return [newMessage, ...prevMessages];
    });
    setInput("");

    try {
      const docRef = await addDoc(
        collection(db, "matches", matchDetails.id, "messages"),
        message
      );
      setNewMessageTrigger(true);
    } catch (error) {
      console.log("Error sending message:", error);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== newMessage.id)
      );
    }
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

  let isInputNotEmpty = input.length > 0;

  const handleInputChange = (text) => {
    setInput(text);
  };

  useEffect(() => {
    if (input.length > 0) {
      Animated.parallel([
        Animated.timing(sendButtonOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(micButtonOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(sendButtonOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(micButtonOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [input]);

  const matchedUserInfo = getMatchedUserInfo(matchDetails?.users, user.user_id);
  const matchedUserName =
    matchedUserInfo.first_name + " " + matchedUserInfo.last_name;
  const matchedBusinessName = matchedUserInfo.business_name;

  const renderMessageItem = (message, index) => {
    const messageDate = message.date;

    const isFirstMessageOfDay =
      index === messages.length - 1 || messageDate !== messages[index + 1].date;

    return (
      <>
        {message.userId === user.user_id ? (
          <SenderMessage
            key={message.id}
            message={message}
            isSending={message?.isSending || false}
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
                <View
                  style={{
                    flex: 1,
                    justifyContent: "flex-end",
                    flexDirection: "row",
                  }}
                >
                  <TouchableOpacity onPress={cancelRecording}>
                    <Ionicons name="stop" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ) : (
              <>
                <TextInput
                  ref={inputRef}
                  style={{ maxHeight: maxTextInputHeight }}
                  className="flex-1 text-lg pr-2 bg-white rounded-3xl py-2 px-4"
                  placeholder="Send Message"
                  onChangeText={handleInputChange}
                  value={input}
                  multiline={true}
                  numberOfLines={1}
                  onContentSizeChange={handleContentSizeChange}
                />
                <TouchableOpacity onPress={pickImage}>
                  <Ionicons name="camera-outline" size={28} />
                </TouchableOpacity>
              </>
            )}
          </View>
          <TouchableOpacity
            className={`rounded-full py-2 px-3 self-center bg-green-500`}
            onPress={
              isInputNotEmpty
                ? () => sendMessage("text", input)
                : isRecording
                ? stopRecording
                : startRecording
            }
          >
            {!isInputNotEmpty ? (
              !isRecording ? (
                <Animated.View style={{ opacity: micButtonOpacity }}>
                  <Ionicons name="mic" size={24} color="#FFFFFF" />
                </Animated.View>
              ) : (
                <Ionicons name="paper-plane" size={24} color="#FFFFFF" />
              )
            ) : (
              <Animated.View style={{ opacity: sendButtonOpacity }}>
                <Ionicons name="paper-plane" size={24} color="#FFFFFF" />
              </Animated.View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
