import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import CustomHeader from "../../components/CustomHeader";

const PaymentScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <CustomHeader
        OpenDrawer={() => navigation.openDrawer()}
        showMenuIcon={true}
      />
      <View className="items-center justify-center">
        <Text>PaymentScreen</Text>
      </View>
    </SafeAreaView>
  );
};

export default PaymentScreen;
