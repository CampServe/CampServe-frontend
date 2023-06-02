import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import CustomModal from "../../components/CustomModal";

const OTPVerificationScreen = () => {
  const { params } = useRoute();
  const navigation = useNavigation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);

  const handleVerification = async () => {
    if (otp.length !== 6) {
      setError("OTP should be 6 digits");
      return;
    }

    if (otp == params.otp) {
      setOtpSuccess(true);
      setIsModalVisible(true);
    } else {
      setIsModalVisible(true);
    }
    setOtp("");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setError("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [error]);

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
    >
      <View className="bg-white p-6 rounded-lg">
        <Text className="text-2xl font-bold mb-6 text-center">
          OTP Verification
        </Text>

        <View className="mb-4">
          <Text className="text-sm font-bold mb-1">Enter OTP</Text>
          <TextInput
            className="border border-gray-300 w-64 rounded-lg px-4 py-2"
            placeholder="OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          {error !== "" && (
            <Text className="text-red-500 text-xs mt-1">{error}</Text>
          )}
        </View>
        <View className="items-center justify-center">
          <TouchableOpacity
            className="bg-green-500 py-2 w-[70%] px-4 rounded-lg"
            onPress={handleVerification}
          >
            <Text className="text-center text-white  text-base">Verify</Text>
          </TouchableOpacity>
        </View>
      </View>

      {otpSuccess ? (
        <CustomModal
          isVisible={isModalVisible}
          title="Validation Success"
          message="You may sign up now"
          buttonText="OK"
          onButtonPress={() => navigation.navigate("UserSignup", { params })}
        />
      ) : (
        <CustomModal
          isVisible={isModalVisible}
          title="Validation Error"
          message="Wrong OTP Entered"
          buttonText="OK"
          onButtonPress={() => navigation.navigate("StudentVerification")}
        />
      )}
    </View>
  );
};

export default OTPVerificationScreen;
