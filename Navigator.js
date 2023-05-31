import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import OnboardingScreen from "./src/screens/common_screens/OnboardingScreen";
import LoginScreen from "./src/screens/common_screens/LoginScreen";
import AppWrapper from "./AppWrapper";
import UserSignupScreen from "./src/screens/common_screens/UserSignupScreen";
import UserDashboard from "./src/screens/user_screens/UserDashboard";
import PaymentScreen from "./src/screens/user_screens/PaymentScreen";
import ActivityScreen from "./src/screens/user_screens/ActivityScreen";
import MessageScreen from "./src/screens/user_screens/MessageScreen";
import SettingsScreen from "./src/screens/user_screens/SettingsScreen";
import HelpsAndFaqsScreen from "./src/screens/user_screens/HelpsAndFaqsScreen";
import AboutUsScreen from "./src/screens/user_screens/AboutUsScreen";
import { Ionicons } from "@expo/vector-icons";
import CustomDrawerContent from "./src/components/CustomDrawerContent";
import { useNavigation } from "@react-navigation/native";
import SearchScreen from "./src/screens/user_screens/SearchScreen";
import ProfileScreen from "./src/screens/user_screens/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const CustomBackButton = ({ onPress }) => {
  return (
    <Ionicons
      name="arrow-back"
      size={24}
      color="black"
      style={{ marginLeft: 10 }}
      onPress={onPress}
    />
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "green",
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === "UserDashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Search") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Payment") {
            iconName = focused ? "card" : "card-outline";
          } else if (route.name === "Activity") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "Message") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="UserDashboard"
        component={UserDashboard}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Payment" component={PaymentScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Message" component={MessageScreen} />
    </Tab.Navigator>
  );
};

const DrawerStackNavigator = () => {
  const navigation = useNavigation();
  const goBack = () => {
    navigation.goBack();
  };
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DrawerTabs" component={TabNavigator} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Help" component={HelpsAndFaqsScreen} />
      <Stack.Screen name="About" component={AboutUsScreen} />
    </Stack.Navigator>
  );
};

const DrawerNavigator = () => {
  const navigation = useNavigation();
  return (
    <Drawer.Navigator
      useLegacyImplementation={true}
      initialRouteName="DrawerTabs"
      screenOptions={{
        headerTitle: () => null,
        headerShown: false,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="DrawerTabs" component={DrawerStackNavigator} />
    </Drawer.Navigator>
  );
};

export const StackNavigator = () => {
  return (
    <AppWrapper>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Onboarding"
      >
        <Stack.Group>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="UserSignup" component={UserSignupScreen} />
        </Stack.Group>

        <Stack.Group>
          <Stack.Screen name="User" component={DrawerNavigator} />
        </Stack.Group>
      </Stack.Navigator>
    </AppWrapper>
  );
};
