import React from "react";
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
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

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
      <View className="flex-1 flex-col h-full px-2">
        <View className="flex flex-row-reverse justify-between mt-4">
          <View>
            <TouchableOpacity
              activeOpacity={0.5}
              //   onPress={closeDrawer}
              className="mb-2"
            >
              <Ionicons name="close" size={24} color="gray" />
            </TouchableOpacity>
          </View>
          <View className="flex flex-col  ">
            <Image
              source={{ uri: "https://i.redd.it/ppohcjn7kfl71.jpg" }}
              className="w-14 h-14 rounded-full"
            />
            <Text className="text-gray-500 text-2xl font-bold mt-4">
              Isaac Sam
            </Text>
            <Text className="text-gray-400 text-xl font-semibold">iensam</Text>
            <Text className="text-gray-400 text-lg">20665968</Text>
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
      <View className=" flex-row items-center px-2">
        <TouchableOpacity
          activeOpacity={0.5}
          className="flex flex-row flex-1 space-x-6 mt-10 items-center rounded-lg bg-red-500 p-3 pl-4"
          onPress={() => navigation.navigate("Login")}
        >
          <Ionicons name="log-out" size={24} color="white" className="mr-3 " />
          <Text className="text-white text-lg">Logout</Text>
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
