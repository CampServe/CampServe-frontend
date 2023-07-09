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
import useProvider from "../hooks/useProvider";
import useSearch from "../hooks/useSearch";

const ChatList = () => {
  const { user } = useAuth();
  const { newMessageTrigger } = useProvider();
  const [matches, setMatches] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const { searchQueries } = useSearch();

  const sortMessagesByTimestamp = (matches) => {
    return matches.sort((b, a) => {
      const aTimestamp = a.lastMessage?.timestamp.toDate() || 0;
      const bTimestamp = b.lastMessage?.timestamp.toDate() || 0;
      return aTimestamp.valueOf() - bTimestamp.valueOf();
    });
  };

  useEffect(() => {
    setLoadingChats(true);

    const fetchData = async () => {
      try {
        const matchesSnapshot = await new Promise((resolve, reject) => {
          const unsubscribeMatches = onSnapshot(
            query(collection(db, "matches")),
            resolve,
            reject
          );

          return unsubscribeMatches;
        });

        const matchesData = matchesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const fetchMessageData = async () => {
          const messagePromises = matchesData.map(async (match) => {
            const messagesQuery = query(
              collection(db, "matches", match.id, "messages"),
              orderBy("timestamp", "asc")
            );

            const messagesSnapshot = await new Promise((resolve, reject) => {
              const unsubscribeMessages = onSnapshot(
                messagesQuery,
                resolve,
                reject
              );

              return unsubscribeMessages;
            });

            const firstMessage = messagesSnapshot.docs[0];
            const lastMessage =
              messagesSnapshot.docs[messagesSnapshot.docs.length - 1];

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

          setMatches(filteredMessages);

          if (filteredMessages.length === 0) {
            setLoadingChats(false);
          }
        };

        await fetchMessageData();
      } catch (error) {
        console.error("Error fetching data:", error);
        setMatches([]);
        setLoadingChats(false);
      }
    };

    fetchData();
  }, [user, newMessageTrigger]);

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
    if (matches.length > 0) {
      let filtered = matches.filter((match) => {
        const users = Object.values(match.users);
        return users.some(
          (user) =>
            user.sub_categories &&
            user.sub_categories.includes(selectedSubCategory)
        );
      });

      const searchQuery = searchQueries["message"]?.trim().toLowerCase();

      if (searchQuery) {
        filtered = filtered.filter((match) => {
          const { users } = match;
          const businessName = Object.values(users)[1]?.business_name || "";
          const firstName = Object.values(users)[0]?.first_name || "";
          const lastName = Object.values(users)[0]?.last_name || "";

          const fullName = `${firstName} ${lastName}`;

          return (
            businessName.toLowerCase().includes(searchQuery) ||
            fullName.toLowerCase().includes(searchQuery)
          );
        });
      }

      const sortedFilteredMatches = sortMessagesByTimestamp(filtered);

      setFilteredMatches(sortedFilteredMatches);
    }
  }, [matches, selectedSubCategory, searchQueries]);

  useEffect(() => {
    if (subCategories.length > 0) {
      handleSubCategorySelect(subCategories[0].name);
    }
  }, [subCategories]);

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
                className="mr-2 mb-4 rounded-3xl"
                key={subCategory.name}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor:
                    subCategory.name === selectedSubCategory
                      ? "#22543D"
                      : "#CED4DA",
                  transform: [
                    {
                      scale: subCategory.name === selectedSubCategory ? 1 : 1,
                    },
                  ],
                  transition: "transform 0.3s",
                }}
                onPress={() => handleSubCategorySelect(subCategory.name)}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    className="text-base"
                    style={{
                      color:
                        subCategory.name === selectedSubCategory
                          ? "#FFF"
                          : "#000",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {subCategory.name}
                  </Text>
                  {subCategory.readCount !== 0 && (
                    <Text
                      className={`text-xs font-bold ${
                        subCategory.name === selectedSubCategory
                          ? "text-black"
                          : "text-white"
                      }  ${
                        subCategory.name === selectedSubCategory
                          ? "bg-gray-500"
                          : "bg-green-500"
                      } rounded-full px-2 py-1 ml-2`}
                    >
                      {subCategory.readCount}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredMatches.length == 0 ? (
            <View className="flex items-center justify-center">
              <Text className="font-semibold text-base">No chats found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredMatches}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ChatRow matchDetails={item} />}
            />
          )}
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
