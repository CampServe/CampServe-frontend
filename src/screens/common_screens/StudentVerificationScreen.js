import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Backbutton from "../../components/Backbutton";
import { DotIndicator } from "react-native-indicators";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../../hooks/useAuth";
import ScreenWithBackground from "../../components/ScreenWithBackground";
import { Image } from "react-native";

const StudentVerificationScreen = () => {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const { studentVerification, isLoadingVerify } = useAuth();
  const navigation = useNavigation();

  const handleEmailChange = (text) => {
    setEmail(text.trim());
    setIsEmailValid(validateEmail(text.trim()));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@st\.knust\.edu\.gh$/;
    return emailRegex.test(email);
  };

  const handleVerification = async () => {
    Keyboard.dismiss();
    try {
      await studentVerification(email);
      navigation.navigate("OTPVerification", { email });
    } catch (error) {
      console.log(error);
    } finally {
      setEmail("");
    }
  };

  return (
    <ScreenWithBackground>
      <SafeAreaView className="flex-1 items-center justify-center p-6 ">
        <Backbutton />
        <Image
          source={require("../../../assets/CampServe.png")}
          style={{ width: 150, height: 50 }}
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold mt-6 mb-6">
          Student Verification
        </Text>

        <View className="items-center justify-center w-full">
          <View className="w-full mb-4">
            <Text className="text-sm font-bold mb-1">
              Enter your School Email address
            </Text>
            <TextInput
              className={`border focus:border-2 border-green-500 rounded-lg px-4 py-2 focus:border-green-700 focus:outline-none ${
                isEmailValid || email === "" ? "" : "border-red-500"
              }`}
              placeholder=" School Email address"
              value={email}
              onChangeText={handleEmailChange}
            />
            {!isEmailValid && email.length > 0 && (
              <Text className="text-xs text-red-500 mt-1">
                Please enter a valid KNUST student email address.
              </Text>
            )}
          </View>

          {isLoadingVerify ? (
            <View className="h-14 flex items-center justify-center">
              <DotIndicator color="green" count={3} size={10} />
            </View>
          ) : (
            <>
              <TouchableOpacity
                className={`${
                  isEmailValid && email.length > 0
                    ? "bg-green-500"
                    : "bg-gray-500"
                } w-72 text-white py-2 px-4 rounded-lg mt-4`}
                disabled={!isEmailValid || email.length === 0}
                onPress={handleVerification}
              >
                <Text className="text-center text-base text-white">
                  Send OTP
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </ScreenWithBackground>
  );
};

export default StudentVerificationScreen;
