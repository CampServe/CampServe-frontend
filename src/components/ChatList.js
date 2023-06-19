import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
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
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);

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
                orderBy("timestamp", "asc"),
                limit(1)
              )
            );
            const lastMessage = messageSnapshot.docs[0];
            if (lastMessage) {
              return lastMessage.data();
            } else {
              return null;
            }
          });

          const lastMessages = await Promise.all(timestampPromises);
          const matchesWithMessages = matchesData
            .map((match, index) => ({
              ...match,
              lastMessage: lastMessages[index],
            }))
            .filter((match) => {
              const lastMessage = match.lastMessage;
              if (!lastMessage) {
                return false;
              }

              const userId = lastMessage.userId;

              if (user.account_type === "provider") {
                return (
                  match.lastMessageTimestamp !== null &&
                  match.users[user.user_id] &&
                  userId !== user.user_id
                );
              } else {
                return (
                  match.lastMessageTimestamp !== null &&
                  match.users[user.user_id] &&
                  userId === user.user_id
                );
              }
            })

            .sort((a, b) => a.lastMessage.timestamp - b.lastMessage.timestamp);

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

  useEffect(() => {
    if (matches.length > 0) {
      const uniqueSubCategories = [
        ...new Set(
          matches.flatMap((match) =>
            Object.values(match.users).map((user) => user.sub_categories)
          )
        ),
      ].filter(Boolean);

      setSubCategories(uniqueSubCategories);

      if (uniqueSubCategories.length > 0 && !selectedSubCategory) {
        handleSubCategorySelect(uniqueSubCategories[0]);
      }
    }
  }, [matches, selectedSubCategory]);

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory);
    const filtered = matches.filter((match) => {
      const users = Object.values(match.users);
      return users.some(
        (user) =>
          user.sub_categories && user.sub_categories.includes(subCategory)
      );
    });

    setFilteredMatches(filtered);
  };

  return (
    <View className="flex">
      {loadingChats ? (
        <Loader />
      ) : matches.length > 0 ? (
        <>
          <ScrollView
            // style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            horizontal
            showsHorizontalScrollIndicator={false}
            className="gap-2 mb-4"
          >
            {subCategories.map((subCategory) => (
              <TouchableOpacity
                key={subCategory}
                style={{
                  width: 120,
                }}
                onPress={() => handleSubCategorySelect(subCategory)}
                className={`flex-1 h-10 items-center justify-center py-2 rounded-lg ${
                  subCategory === selectedSubCategory
                    ? "bg-green-900"
                    : "bg-green-900 opacity-60"
                }`}
              >
                <Text className="text-white text-bold text-center text-base">
                  {subCategory}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredMatches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatRow matchDetails={item} />}
          />
        </>
      ) : (
        <View className="flex items-center justify-center">
          <Text className="font-semibold text-base">
            No messages at the moment
          </Text>
        </View>
      )}
    </View>
  );
};

export default ChatList;
