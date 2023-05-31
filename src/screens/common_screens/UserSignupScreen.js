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

const UserSignupScreen = () => {
  const initialFormData = {
    fullname: "",
    email: "",
    username: "",
    password: "",
    studentRefNumber: "",
    confirmPassword: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
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
    const { username, password, confirmPassword, studentRefNumber, email } =
      formData;

    const hasFieldErrors = Object.values(fieldErrors).some(
      (error) => error !== ""
    );

    return (
      !username ||
      !password ||
      !confirmPassword ||
      !studentRefNumber ||
      !email ||
      !passwordMatch ||
      hasFieldErrors
    );
  };

  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "fullname":
        if (value.length < 7) {
          error = "Full Name should be at least 7 characters long.";
        }
        break;
      case "username":
        if (value.length < 4) {
          error = "Username should be at least 4 characters long.";
        }
        break;
      case "studentRefNumber":
        if (value.length !== 8 || isNaN(value)) {
          error = "Student Reference Number should be exactly 8 numbers.";
        }
        break;
      case "email":
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(value)) {
          error = "Invalid email format.";
        }
        break;
      case "password":
        if (value.length < 5) {
          error = "Password should be at least 5 characters long.";
        }
        break;
      case "confirmPassword":
        if (value !== formData.password) {
          error = "Passwords do not match.";
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
    const value = formData[field];
    validateField(field, value);
  };

  const validateConfirmPassword = () => {
    if (formData.confirmPassword !== formData.password) {
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: "Passwords do not match.",
      }));
    } else {
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: undefined,
      }));
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      confirmPassword: value,
    }));

    if (value === "") {
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: undefined,
      }));
    } else {
      validateConfirmPassword();
    }
  };

  const handleUserSignup = () => {
    setIsLoading(true);
    console.log("You have Signed up");
    setIsModalVisible(true);
    setFormData(initialFormData);

    setTimeout(() => {
      setIsLoading(false);
      // Continue with signup logic
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-6 bg-white">
      <Backbutton />
      <Text className="text-2xl font-bold mb-6">Sign Up</Text>

      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
          width: 336,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full mb-4">
          <Text className="text-sm font-bold mb-1">Enter Full Name</Text>
          <TextInput
            className="border focus:border-2 border-green-500 rounded-lg px-4 py-2 focus:border-green-700 focus:outline-none"
            placeholder="Full Name"
            value={formData.fullname}
            onChangeText={(value) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                fullname: value,
              }))
            }
            onBlur={() => handleFieldBlur("fullname")}
          />
          {fieldErrors.fullname && (
            <Text className="text-xs text-red-500 mt-1">
              {fieldErrors.fullname}
            </Text>
          )}
        </View>

        <View className="w-full mb-4">
          <Text className="text-sm font-bold mb-1">Enter username</Text>
          <TextInput
            className="border focus:border-2 border-green-500 rounded-lg px-4 py-2 focus:border-green-700 focus:outline-none"
            placeholder="Username"
            value={formData.username}
            onChangeText={(value) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                username: value,
              }))
            }
            onBlur={() => handleFieldBlur("username")}
          />
          {fieldErrors.username && (
            <Text className="text-xs text-red-500 mt-1">
              {fieldErrors.username}
            </Text>
          )}
        </View>

        <View className="w-full mb-4">
          <Text className="text-sm font-bold mb-1">
            Enter Student Reference Number
          </Text>
          <TextInput
            className="border focus:border-2 border-green-500 rounded-lg px-4 py-2 focus:border-green-700 focus:outline-none"
            placeholder="Student Reference Number"
            keyboardType="number-pad"
            value={formData.studentRefNumber}
            onChangeText={(value) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                studentRefNumber: value,
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
          <Text className="text-sm font-bold mb-1">Enter Email</Text>
          <TextInput
            className="border focus:border-2 border-green-500 rounded-lg px-4 py-2 focus:border-green-700 focus:outline-none"
            placeholder="Email"
            value={formData.email}
            onChangeText={(value) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                email: value,
              }))
            }
            onBlur={() => handleFieldBlur("email")}
          />
          {fieldErrors.email && (
            <Text className="text-xs text-red-500 mt-1">
              {fieldErrors.email}
            </Text>
          )}
        </View>

        <View className="w-full mb-4">
          <Text className="text-sm font-bold mb-1">Enter Password</Text>
          <View
            className="flex-row items-center border border-green-500 
                rounded-lg px-4 py-2  focus:border-green-700 focus:border-2"
          >
            <TextInput
              className="flex-1 text-sm "
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(value) =>
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  password: value,
                }))
              }
              onBlur={() => handleFieldBlur("password")}
            />
            <TouchableOpacity onPress={() => handleTogglePassword("password")}>
              <Icon
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#555"
              />
            </TouchableOpacity>
          </View>
          {fieldErrors.password && (
            <Text className="text-xs text-red-500 mt-1">
              {fieldErrors.password}
            </Text>
          )}
        </View>

        <View className="w-full mb-4">
          <Text className="text-sm font-bold mb-1">Confirm Password</Text>
          <View
            className="flex-row items-center border border-green-500 
                rounded-lg px-4 py-2  focus:border-green-700 focus:border-2"
          >
            <TextInput
              className="flex-1 text-sm "
              placeholder="Confirm Password"
              secureTextEntry={!showConfirmPassword}
              value={formData.confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              onBlur={() => handleFieldBlur("confirmPassword")}
            />
            <TouchableOpacity
              onPress={() => handleTogglePassword("confirmPassword")}
            >
              <Icon
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color="#555"
              />
            </TouchableOpacity>
          </View>
          {fieldErrors.confirmPassword && (
            <Text className="text-xs text-red-500 mt-1">
              {fieldErrors.confirmPassword}
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
                isSignupDisabled() ? "bg-gray-500" : "bg-green-500"
              } w-72 text-white py-2 px-4 rounded-lg mt-4`}
              disabled={isSignupDisabled()}
              onPress={handleUserSignup}
            >
              <Text className="text-center text-base text-white">Sign Up</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
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
