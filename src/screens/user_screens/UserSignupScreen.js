import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import Backbutton from "../../components/Backbutton";
import CustomModal from "../../components/CustomModal";
import { DotIndicator } from "react-native-indicators";
import { useNavigation } from "@react-navigation/native";

const UserSignupScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [studentRefNumber, setStudentRefNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleTogglePassword = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const isSignupDisabled = () => {
    return (
      !username ||
      !password ||
      !confirmPassword ||
      !studentRefNumber ||
      !passwordMatch
    );
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (value === "") {
      setPasswordMatch(true);
    } else {
      setPasswordMatch(password === value);
    }
  };

  const validateStudentReferenceNumber = async (studentRefNumber) => {
    try {
      const response = await fetch("YOUR_API_ENDPOINT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentRefNumber }),
      });

      const data = await response.json();

      return data.isValid;
    } catch (error) {
      console.error("Error validating student reference number:", error);
      return false;
    }
  };

  const handleUserSignup = async () => {
    setIsLoading(true);
    //    const isValidStudent = await validateStudentReferenceNumber(
    //      studentRefNumber
    //    );
    console.log("You have Signed up");
    //    if (!isValidStudent) return setIsModalVisible(true);
    setIsModalVisible(true);
    setUsername("");
    setStudentRefNumber("");
    setPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      setIsLoading(false);
      // Continue with signup logic
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-6 bg-white">
      <Backbutton />
      <Text className="text-2xl font-bold mb-6">Sign Up</Text>

      <View className="w-full mb-4">
        <Text className="text-sm font-bold mb-1">Enter Username</Text>
        <TextInput
          className="border border-green-500 rounded-lg px-4 py-2"
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View className="w-full mb-4">
        <Text className="text-sm font-bold mb-1">
          Enter Student Reference Number
        </Text>
        <TextInput
          className="border border-green-500 rounded-lg px-4 py-2"
          placeholder="Student Reference Number"
          value={studentRefNumber}
          keyboardType="number-pad"
          onChangeText={setStudentRefNumber}
        />
      </View>

      <View className="w-full mb-4">
        <Text className="text-sm font-bold mb-1">Enter Password</Text>
        <View className="flex-row items-center border border-green-500 rounded-lg px-4 py-2">
          <TextInput
            className="flex-1 text-sm"
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => handleTogglePassword("password")}>
            <Icon
              name={showPassword ? "eye-off" : "eye"}
              type="ionicon"
              size={20}
              color="#555"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View className="w-full mb-4">
        <Text className="text-sm font-bold mb-1">Confirm Password</Text>
        <View className="flex-row items-center border border-green-500 rounded-lg px-4 py-2">
          <TextInput
            className="flex-1 text-sm"
            placeholder="Confirm Password"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
          />
          <TouchableOpacity
            onPress={() => handleTogglePassword("confirmPassword")}
          >
            <Icon
              name={showConfirmPassword ? "eye-off" : "eye"}
              type="ionicon"
              size={20}
              color="#555"
            />
          </TouchableOpacity>
        </View>
        {!passwordMatch && (
          <Text className="text-xs text-red-500 mt-1">
            Passwords do not match
          </Text>
        )}
      </View>

      <TouchableOpacity
        className={`${
          !isLoading
            ? isSignupDisabled()
              ? "bg-gray-500"
              : "bg-green-500"
            : "bg-white"
        } w-72 text-white py-2 px-4 rounded-lg mt-4 `}
        disabled={isSignupDisabled()}
        onPress={handleUserSignup}
      >
        {isLoading ? (
          <DotIndicator color="green" count={3} size={10} />
        ) : (
          <Text className="text-center text-base text-white">Sign Up</Text>
        )}
      </TouchableOpacity>

      <View className="text-gray-700 text-sm mt-4 flex-row justify-center items-center pt-4">
        <Text>Sign up as a</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("ServiceProviderSignup")}
        >
          <Text style={{ color: "#34D399", fontWeight: "bold" }}>
            {" "}
            Service Provider{" "}
          </Text>
        </TouchableOpacity>
      </View>

      <CustomModal
        isVisible={isModalVisible}
        onClose={closeModal}
        title="Signup Error"
        message="Only KNUST students are allowed to create an account."
        buttonText="OK"
        onButtonPress={closeModal}
      />
    </SafeAreaView>
  );
};

export default UserSignupScreen;
