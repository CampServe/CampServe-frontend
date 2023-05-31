import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import Backbutton from "../../components/Backbutton";
import CustomModal from "../../components/CustomModal";
import { DotIndicator } from "react-native-indicators";
import { useNavigation } from "@react-navigation/native";

const StudentVerificationScreen = () => {
  const initialVerificationData = {
    schoolUsername: "",
    studentRefNumber: "",
    password: "",
  };

  const [verificationData, setVerificationData] = useState(
    initialVerificationData
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigation = useNavigation();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const isVerificationDisabled = () => {
    const { schoolUsername, studentRefNumber, password } = verificationData;

    const hasFieldErrors = Object.values(fieldErrors).some(
      (error) => error !== ""
    );

    return !schoolUsername || !studentRefNumber || !password || hasFieldErrors;
  };

  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "schoolUsername":
        if (value.length < 4) {
          error = "School username should be at least 4 characters long.";
        }
        break;
      case "studentRefNumber":
        if (value.length !== 8 || isNaN(value)) {
          error = "Student Reference Number should be exactly 8 numbers.";
        }
        break;
      case "password":
        if (value.length < 5) {
          error = "Password should be at least 5 characters long.";
        }
        break;
      default:
        break;
    }

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));
  };

  const handleFieldBlur = (field) => {
    const value = verificationData[field];
    validateField(field, value);
  };

  const handleVerification = () => {
    setIsLoading(true);
    // Simulating API request
    setTimeout(() => {
      setIsLoading(false);

      // Simulating successful verification
      if (
        verificationData.schoolUsername === "iensam" &&
        verificationData.studentRefNumber === "20665968" &&
        verificationData.password === "epaphras"
      ) {
        setModalTitle("Successful Verification");
        setModalMessage("You may sign up now.");
        setIsModalVisible(true);
      } else {
        setModalTitle("Verification Failed");
        setModalMessage("Please check your details and try again.");
        setIsModalVisible(true);
        setVerificationData(initialVerificationData);
      }
    }, 2000);
  };

  const handleModalButtonPress = () => {
    setIsModalVisible(false);
    if (modalTitle === "Successful Verification") {
      navigation.navigate("UserSignup", {
        studentRefNumber: verificationData.studentRefNumber,
      });
    }
  };

  return (
    <>
      <SafeAreaView className="flex-1 items-center justify-center p-6 bg-white">
        <Backbutton />
        <Text className="text-2xl font-bold mb-6">Student Verification</Text>

        <View className="items-center justify-center w-full">
          <View className="w-full mb-4">
            <Text className="text-sm font-bold mb-1">
              Enter your School Username
            </Text>
            <TextInput
              className="border focus:border-2 border-green-500 rounded-lg px-4 py-2 focus:border-green-700 focus:outline-none"
              placeholder="School username"
              value={verificationData.schoolUsername}
              onChangeText={(text) =>
                setVerificationData((prevState) => ({
                  ...prevState,
                  schoolUsername: text,
                }))
              }
              onBlur={() => handleFieldBlur("schoolUsername")}
            />
            {fieldErrors.schoolUsername && (
              <Text className="text-xs text-red-500 mt-1">
                {fieldErrors.schoolUsername}
              </Text>
            )}
          </View>

          <View className="w-full mb-4">
            <Text className="text-sm font-bold mb-1">
              Enter your Student Reference Number
            </Text>
            <TextInput
              className="border focus:border-2 border-green-500 rounded-lg px-4 py-2 focus:border-green-700 focus:outline-none"
              placeholder="Student reference number"
              value={verificationData.studentRefNumber}
              onChangeText={(text) =>
                setVerificationData((prevState) => ({
                  ...prevState,
                  studentRefNumber: text,
                }))
              }
              onBlur={() => handleFieldBlur("studentRefNumber")}
            />
            {fieldErrors.studentRefNumber && (
              <Text className="text-xs text-red-500 mt-1">
                {fieldErrors.studentRefNumber}
              </Text>
            )}
          </View>

          <View className="w-full mb-4">
            <Text className="text-sm font-bold mb-1">
              Enter your School Password
            </Text>
            <View
              className="flex-row items-center border border-green-500 
                rounded-lg px-4 py-2  focus:border-green-700 focus:border-2"
            >
              <TextInput
                className="flex-1 text-sm"
                placeholder="School password"
                value={verificationData.password}
                secureTextEntry={!showPassword}
                onChangeText={(text) =>
                  setVerificationData((prevState) => ({
                    ...prevState,
                    password: text,
                  }))
                }
                onBlur={() => handleFieldBlur("password")}
              />
              <TouchableOpacity onPress={handleTogglePassword} className="ml-2">
                <Icon
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={showPassword ? "#888888" : "#333333"}
                />
              </TouchableOpacity>
            </View>
            {fieldErrors.password && (
              <Text className="text-xs text-red-500 mt-1">
                {fieldErrors.password}
              </Text>
            )}
          </View>

          {isLoading ? (
            <View className="h-14 flex items-center justify-center">
              <DotIndicator color="green" count={3} size={10} />
            </View>
          ) : (
            <>
              <TouchableOpacity
                className={`${
                  isVerificationDisabled() ? "bg-gray-500" : "bg-green-500"
                } w-72 text-white py-2 px-4 rounded-lg mt-4`}
                disabled={isVerificationDisabled()}
                onPress={handleVerification}
              >
                <Text className="text-center text-base text-white">
                  Verify Details
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <CustomModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          title={modalTitle}
          message={modalMessage}
          buttonText="OK"
          onButtonPress={handleModalButtonPress}
        />
      </SafeAreaView>
    </>
  );
};

export default StudentVerificationScreen;
