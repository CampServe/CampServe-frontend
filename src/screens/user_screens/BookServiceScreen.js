import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

const BookServiceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { provider } = route.params;

  return (
    <SafeAreaView>
      <Text>BookServiceScreen</Text>
    </SafeAreaView>
  );
};

export default BookServiceScreen;
