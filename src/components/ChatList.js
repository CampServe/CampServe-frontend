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
  where,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import useAuth from "../hooks/useAuth";
import ChatRow from "./ChatRow";
import Loader from "./Loader";
import { useIsFocused } from "@react-navigation/native";

const ChatList = () => {
  const [matches, setMatches] = useState([]);
  const { user } = useAuth();
  const [loadingChats, setLoadingChats] = useState(true);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const isFocused = useIsFocused();

  const sortMessagesByTimestamp = (matches) => {
    return matches.sort((a, b) => {
      const aTimestamp = a.lastMessage?.timestamp || 0;
      const bTimestamp = b.lastMessage?.timestamp || 0;
      return aTimestamp - bTimestamp;
    });
  };

  useEffect(() => {
    if (isFocused) {
      setLoadingChats(true);

      const fetchData = async () => {
        try {
          const snapshot = await new Promise((resolve, reject) => {
            const unsubscribe = onSnapshot(
              query(collection(db, "matches")),
              resolve,
              reject
            );

            return unsubscribe;
          });

          const matchesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const fetchMessageData = async () => {
            const messagePromises = matchesData.map(async (match) => {
              const messageSnapshot = await getDocs(
                query(
                  collection(db, "matches", match.id, "messages"),
                  orderBy("timestamp", "asc")
                  // limit(1)
                )
              );

              const firstMessage = messageSnapshot.docs[0];
              const lastMessage =
                messageSnapshot.docs[messageSnapshot.docs.length - 1];
              // console.log("first:", firstMessage.data());
              // console.log("last:", lastMessage.data());
              let firstMessageData = null;
              if (firstMessage) {
                firstMessageData = firstMessage.data();
              }

              let lastMessageData = null;
              if (lastMessage) {
                lastMessageData = lastMessage.data();
              }

              return {
                ...match,
                firstMessage: firstMessageData,
                lastMessage: lastMessageData,
              };
            });

            const messagesData = await Promise.all(messagePromises);
            const filteredMessages = messagesData.filter((match) => {
              const { firstMessage, lastMessage } = match;

              if (!firstMessage || !lastMessage) {
                return false;
              }

              const userId = firstMessage.userId;

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
            });

            const sortedMessages = await sortMessagesByTimestamp(
              filteredMessages
            );

            // console.log(filteredMessages);
            // console.log(sortedMessages);

            setMatches(sortedMessages);
          };

          await fetchMessageData();
        } catch (error) {
          console.error("Error fetching data:", error);
          setMatches([]);
        }
      };

      fetchData();
    }
  }, [user, db, isFocused]);

  useEffect(() => {
    if (matches.length > 0) {
      const uniqueSubCategories = [
        ...new Set(
          matches.flatMap((match) =>
            Object.values(match.users).map((user) => user.sub_categories)
          )
        ),
      ].filter(Boolean);

      const fetchUnreadCounts = async () => {
        const unreadCountsPromises = uniqueSubCategories.map(
          async (subCategory) => {
            const subCategoryMatches = matches.filter((match) =>
              Object.values(match.users).some(
                (user) => user.sub_categories === subCategory
              )
            );

            const unreadCountsPromises = subCategoryMatches.map(
              async (match) => {
                const messageSnapshot = await getDocs(
                  query(
                    collection(db, "matches", match.id, "messages"),
                    where("read", "==", false)
                  )
                );

                const unreadMessages = messageSnapshot.docs.filter(
                  (doc) => doc.data().userId !== user.user_id
                );
                return unreadMessages.length;
              }
            );

            const unreadCounts = await Promise.all(unreadCountsPromises);
            const totalUnreadCount = unreadCounts.reduce(
              (sum, count) => sum + count,
              0
            );

            return {
              name: subCategory,
              readCount: totalUnreadCount,
            };
          }
        );

        const unreadCountsData = await Promise.all(unreadCountsPromises);
        setSubCategories(unreadCountsData);

        setLoadingChats(false);
      };

      fetchUnreadCounts();
    }
  }, [matches]);

  useEffect(() => {
    if (subCategories.length > 0 && !selectedSubCategory) {
      handleSubCategorySelect(subCategories[0].name);
    }
  }, [subCategories, selectedSubCategory]);

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory);
    const filtered = matches.filter((match) => {
      const users = Object.values(match.users);
      return users.some(
        (user) =>
          user.sub_categories && user.sub_categories.includes(subCategory)
      );
    });

    const sortedFilteredMatches = sortMessagesByTimestamp(filtered);

    console.log("a", filtered);
    console.log("b", sortedFilteredMatches);
    setFilteredMatches(sortedFilteredMatches);
  };

  return (
    <View className="flex">
      {loadingChats ? (
        <Loader />
      ) : matches.length > 0 ? (
        <>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16 }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {subCategories.map((subCategory) => (
              <TouchableOpacity
                className="m-1 mb-4"
                key={subCategory.name}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 16,
                  marginRight: 8,
                  // elevation: 2,
                  backgroundColor:
                    subCategory.name === selectedSubCategory
                      ? "#34B7F1"
                      : "#34B7F1AA",
                  transform: [
                    {
                      scale: subCategory.name === selectedSubCategory ? 1.1 : 1,
                    },
                  ],
                  transition: "transform 0.3s",
                }}
                onPress={() => handleSubCategorySelect(subCategory.name)}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      color: "#FFF",
                      fontWeight: "bold",
                      fontSize: 16,
                      textAlign: "center",
                    }}
                  >
                    {subCategory.name}
                  </Text>
                  {subCategory.readCount !== 0 && (
                    <Text className="text-xs font-bold text-white bg-blue-500 rounded-full px-2 py-1 ml-2">
                      {subCategory.readCount}
                    </Text>
                  )}
                </View>
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
          <Text className="font-semibold text-base">No chats found</Text>
        </View>
      )}
    </View>
  );
};

export default ChatList;
