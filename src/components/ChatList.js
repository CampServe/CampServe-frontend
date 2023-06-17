import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import useAuth from "../hooks/useAuth";
import ChatRow from "./ChatRow";
import Loader from "./Loader";

const ChatList = () => {
  const [matches, setMatches] = useState([]);
  const { user } = useAuth();
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "matches")),
      (snapshot) => {
        const matchesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const fetchLastMessageTimestamp = async () => {
          const timestampPromises = matchesData.map(async (match) => {
            const messageSnapshot = await getDocs(
              query(
                collection(db, "matches", match.id, "messages"),
                orderBy("timestamp", "desc"),
                limit(1)
              )
            );
            const lastMessage = messageSnapshot.docs[0];
            if (lastMessage) {
              return lastMessage.data().timestamp;
            } else {
              return null;
            }
          });

          const lastMessageTimestamps = await Promise.all(timestampPromises);

          const matchesWithMessages = matchesData
            .map((match, index) => ({
              ...match,
              lastMessageTimestamp: lastMessageTimestamps[index],
            }))
            .filter((match) => match.lastMessageTimestamp !== null)
            .sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);

          setLoadingChats(false);
          setMatches(matchesWithMessages);
        };

        fetchLastMessageTimestamp();
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, db, matches]);

  return (
    <>
      {loadingChats ? (
        <Loader />
      ) : matches.length > 0 ? (
        <FlatList
          className="h-full"
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatRow matchDetails={item} />}
        />
      ) : (
        <View className="p-5">
          <Text className="text-center text-lg">No messages at the moment</Text>
        </View>
      )}
    </>
  );
};

export default ChatList;
