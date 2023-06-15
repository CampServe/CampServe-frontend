import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import useAuth from "./src/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";

import AppWrapper from "./AppWrapper";
import OnboardingScreen from "./src/screens/common_screens/OnboardingScreen";
import LoginScreen from "./src/screens/common_screens/LoginScreen";
import StudentVerificationScreen from "./src/screens/common_screens/StudentVerificationScreen";
import OTPVerificationScreen from "./src/screens/common_screens/OTPVerificationScreen";
import UserSignupScreen from "./src/screens/common_screens/UserSignupScreen";

import UserDashboard from "./src/screens/user_screens/UserDashboard";
import PaymentScreen from "./src/screens/user_screens/PaymentScreen";
import ActivityScreen from "./src/screens/user_screens/ActivityScreen";
import MessageScreen from "./src/screens/user_screens/MessageScreen";
import SettingsScreen from "./src/screens/user_screens/SettingsScreen";
import HelpsAndFaqsScreen from "./src/screens/user_screens/HelpsAndFaqsScreen";
import AboutUsScreen from "./src/screens/user_screens/AboutUsScreen";
import CustomDrawerContent from "./src/components/CustomDrawerContent";
import SearchScreen from "./src/screens/user_screens/SearchScreen";
import ProfileScreen from "./src/screens/user_screens/ProfileScreen";

import ServiceProviderOnboardingScreen from "./src/screens/serviceprov_screens/ServiceProviderOnboardingScreen";
import ServiceProviderDashboard from "./src/screens/serviceprov_screens/ServiceProviderDashboard";
import ServiceProviderSettingsScreen from "./src/screens/serviceprov_screens/ServiceProviderSettingsScreen";
import ServiceProviderMessageScreen from "./src/screens/serviceprov_screens/ServiceProviderMessageScreen";
import ServiceProviderPaymentScreen from "./src/screens/serviceprov_screens/ServiceProviderPaymentScreen";
import CustomSPDrawerContent from "./src/components/CustomSPDrawerContent";
import SProfileSetup from "./src/screens/serviceprov_screens/SProfileSetup";
import SelectCategoriesScreen from "./src/screens/serviceprov_screens/SelectCategoriesScreen";
import ServiceDetailsScreen from "./src/screens/user_screens/ServiceDetailsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const UserTabNavigator = () => {
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

const UserDrawerStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UDrawerTabs" component={UserTabNavigator} />
      <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Help" component={HelpsAndFaqsScreen} />
      <Stack.Screen name="About" component={AboutUsScreen} />
    </Stack.Navigator>
  );
};

const UserDrawerNavigator = () => {
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
      <Drawer.Screen name="DrawerTabs" component={UserDrawerStackNavigator} />
    </Drawer.Navigator>
  );
};

const ServiceProviderTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "green",
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === "ServiceProviderDashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "ServiceProviderPayment") {
            iconName = focused ? "card" : "card-outline";
          } else if (route.name === "ServiceProviderMessage") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="ServiceProviderDashboard"
        component={ServiceProviderDashboard}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="ServiceProviderPayment"
        component={ServiceProviderPaymentScreen}
        options={{ tabBarLabel: "Payment" }}
      />
      <Tab.Screen
        name="ServiceProviderMessage"
        component={ServiceProviderMessageScreen}
        options={{ tabBarLabel: "Message" }}
      />
    </Tab.Navigator>
  );
};

const SPDrawerStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="SPUDrawerTabs"
        component={ServiceProviderTabNavigator}
      />
      <Stack.Screen
        name="SPSettings"
        component={ServiceProviderSettingsScreen}
      />
    </Stack.Navigator>
  );
};

const SPDrawerNavigator = () => {
  const navigation = useNavigation();
  return (
    <Drawer.Navigator
      useLegacyImplementation={true}
      initialRouteName="SPDrawerTabs"
      screenOptions={{
        headerTitle: () => null,
        // headerShown: false,
      }}
      drawerContent={(props) => <CustomSPDrawerContent {...props} />}
    >
      <Drawer.Screen name="SPDrawerTabs" component={SPDrawerStackNavigator} />
    </Drawer.Navigator>
  );
};

export const StackNavigator = () => {
  const { user } = useAuth();

  return (
    <AppWrapper>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Group>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="StudentVerification"
              component={StudentVerificationScreen}
            />
            <Stack.Screen
              name="OTPVerification"
              component={OTPVerificationScreen}
              options={{ presentation: "transparentModal" }}
            />
            <Stack.Screen name="UserSignup" component={UserSignupScreen} />
          </Stack.Group>
        ) : (
          <>
            {user.account_type === "regular user" && (
              <Stack.Group>
                <Stack.Screen name="User" component={UserDrawerNavigator} />
              </Stack.Group>
            )}

            {user.account_type === "regular user" &&
              (user.is_service_provider !== true ||
                user.is_service_provider !== "true") && (
                <Stack.Group>
                  <Stack.Screen
                    name="SPOnboarding"
                    component={ServiceProviderOnboardingScreen}
                  />
                  <Stack.Screen
                    name="SProfileSetup"
                    component={SProfileSetup}
                  />
                  <Stack.Screen
                    name="SelectCategories"
                    component={SelectCategoriesScreen}
                  />
                </Stack.Group>
              )}

            {user.account_type == "provider" &&
              (user.is_service_provider !== false ||
                user.is_service_provider !== "false") && (
                <Stack.Group>
                  <Stack.Screen
                    name="Service Provider"
                    component={SPDrawerNavigator}
                  />
                </Stack.Group>
              )}
          </>
        )}
      </Stack.Navigator>
    </AppWrapper>
  );
};
