import React, { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Image,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const CustomHeader = ({
  showMenuIcon = false,
  showBackIcon = false,
  OpenDrawer,
  GoBack,
  updateSearchQuery,
  screen,
  clearInput = false,
  title = "",
  setEditModalVisible,
}) => {
  const navigation = useNavigation();
  const [showSearchInput, setShowSearchInput] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
  };

  useEffect(() => {
    if (clearInput) {
      setShowSearchInput(false);
      if (screen) {
        updateSearchQuery(screen, "");
      }
    }
  }, [clearInput]);

  useEffect(() => {
    const toValue = showSearchInput ? 1 : 0;

    Animated.timing(fadeAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showSearchInput]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setShowSearchInput(false);
      if (screen) {
        updateSearchQuery(screen, "");
      }
    });

    return unsubscribe;
  }, [navigation]);

  const renderLeftIcon = () => {
    if (showMenuIcon) {
      return (
        <TouchableOpacity className="mr-4 " onPress={OpenDrawer}>
          <Ionicons name="menu-outline" size={28} />
        </TouchableOpacity>
      );
    } else if (showBackIcon) {
      return (
        <TouchableOpacity className="mr-4 " onPress={GoBack}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  };

  const handleSearchQueryChange = (query) => {
    updateSearchQuery(screen, query);
  };

  const handleClearSearch = () => {
    toggleSearchInput();
    updateSearchQuery(screen, "");
  };

  const renderSearchInput = () => {
    return (
      <Animated.View
        className="rounded-lg px-4 bg-white border-b border-gray-200 focus:border-gray-400"
        style={{
          flexDirection: "row",
          alignItems: "center",
          opacity: fadeAnim,
          transform: [
            {
              translateX: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
        }}
      >
        <TextInput
          style={{
            flex: 1,
            paddingHorizontal: 12,
            borderRadius: 20,
            backgroundColor: "#FFFFFF",
            marginRight: 8,
          }}
          placeholder="Search..."
          onChangeText={handleSearchQueryChange}
        />
        <TouchableOpacity onPress={handleClearSearch}>
          <Ionicons name="close-outline" size={28} color="gray" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const displaySearchIcon = typeof screen !== "undefined";
  const notification = !showBackIcon && showMenuIcon;

  return (
    <View className="flex-row items-center justify-between pb-4 pt-2 bg-white">
      {showSearchInput ? (
        renderSearchInput()
      ) : (
        <>
          {renderLeftIcon()}

          {!notification && (
            <View className="flex-grow flex items-center">
              <Text className="text-xl text-gray-700 font-bold">{title}</Text>
            </View>
          )}

          {notification && (
            <>
              <Image
                source={require("../../assets/CampServe.png")}
                className="w-24 h-7 rounded-full"
                resizeMode="contain"
              />
              {displaySearchIcon ? (
                <TouchableOpacity onPress={toggleSearchInput}>
                  <Ionicons name="search-outline" size={24} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={setEditModalVisible}>
                  <Ionicons name="create-outline" size={24} />
                </TouchableOpacity>
              )}
            </>
          )}
        </>
      )}
    </View>
  );
};

export default CustomHeader;
