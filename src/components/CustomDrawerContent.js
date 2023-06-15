import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
  StyleSheet,
  TouchableHighlight,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import useAuth from "../hooks/useAuth";

const data = [
  {
    id: "1",
    icon: "person-circle-outline",
    title: "Profile",
    screen: "Profile",
  },
  {
    id: "2",
    icon: "help-circle-outline",
    title: "Help and FAQs",
    screen: "Help",
  },
  {
    id: "3",
    icon: "information-circle-outline",
    title: "About Us",
    screen: "About",
  },
  {
    id: "4",
    icon: "settings",
    title: "Settings",
    screen: "Settings",
  },
];

const CustomDrawerContent = () => {
  const navigation = useNavigation();
  const { user, logout, switchAccount } = useAuth();

  const DrawerItem = ({ icon, title, screen }) => (
    <TouchableHighlight
      underlayColor="#DDDDDD"
      onPress={() => {
        navigation.navigate(screen);
      }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 8,
        marginBottom: 16,
        padding: 12,
        paddingLeft: 16,
      }}
    >
      <>
        <Ionicons
          name={icon}
          size={24}
          color="green"
          style={{ marginRight: 8 }}
        />
        <Text style={{ color: "gray", fontSize: 16 }}>{title}</Text>
      </>
    </TouchableHighlight>
  );

  return (
    <Animated.View style={styles.drawerContainer}>
      <View className="flex-1 flex-col h-full px-2 pt-4">
        <View className="flex flex-start mt-4">
          <View className="flex flex-col  ">
            <Image
              source={{
                uri: "https://thumbs.dreamstime.com/b/user-profile-avatar-icon-134114304.jpg",
              }}
              className="w-14 h-14 rounded-full"
            />
            <Text className="text-gray-500 text-xl font-bold mt-0">
              {user.first_name} {user.last_name}
            </Text>
            <Text className="text-gray-400 text-lg font-semibold">
              {user.username}
            </Text>
            <Text className="text-gray-400 text-base">{user.email}</Text>
          </View>
        </View>
        <View className="border border-t-1 border-gray-200 my-10" />
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DrawerItem
              icon={item.icon}
              title={item.title}
              screen={item.screen}
            />
          )}
        />
      </View>
      <View className="border border-t-1 border-gray-200 " />
      <View className=" flex-row justify-center items-center px-2">
        <TouchableOpacity
          className="flex flex-row space-x-6  mt-10 items-center justify-center rounded-lg bg-green-500 p-3 pl-4"
          onPress={() =>
            user.is_service_provider == "true" ||
            user.is_service_provider === true
              ? switchAccount()
              : navigation.navigate("SPOnboarding")
          }
          // onPress={() =>
          //   navigation.navigate(
          //     user.is_service_provider == "true" ||
          //       user.is_service_provider === true
          //       ? "Service Provider"
          //       : "SPOnboarding"
          //   )
          // }
        >
          <Text className="text-white text-center text-base">
            {user.is_service_provider == "true" ||
            user.is_service_provider === true
              ? "Switch to Service Provider"
              : "Become a Service Provider"}
          </Text>
        </TouchableOpacity>
      </View>
      <View className=" flex-row justify-center items-center px-4">
        <TouchableOpacity
          activeOpacity={0.5}
          className="flex flex-row flex-1 space-x-6 mt-5 items-center rounded-lg bg-red-500 p-3 pl-4"
          onPress={logout}
        >
          <Ionicons name="log-out" size={24} color="white" className="mr-3 " />
          <Text className="text-white text-base">Logout</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  drawerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
