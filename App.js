import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { StackNavigator } from "./Navigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "./src/hooks/useAuth";

const clearAsyncStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log("AsyncStorage cleared successfully");
  } catch (error) {
    console.log("Error clearing AsyncStorage:", error);
  }
};

clearAsyncStorage();

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <StackNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}
