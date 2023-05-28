import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingScreen from "./src/screens/common_screens/OnboardingScreen";
import LoginScreen from "./src/screens/common_screens/LoginScreen";
import AppWrapper from "./AppWrapper";
import UserSignupScreen from "./src/screens/user_screens/UserSignupScreen";
import SProviderSignupScreen from "./src/screens/serviceprov_screens/SProviderSignupScreen";
import UserDashboard from "./src/screens/user_screens/UserDashboard";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <AppWrapper>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Group>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="UserSignup" component={UserSignupScreen} />
          <Stack.Screen
            name="ServiceProviderSignup"
            component={SProviderSignupScreen}
          />
        </Stack.Group>

        <Stack.Group>
          <Stack.Screen name="UserDashboard" component={UserDashboard} />
        </Stack.Group>
      </Stack.Navigator>
    </AppWrapper>
  );
};

export default StackNavigator;
