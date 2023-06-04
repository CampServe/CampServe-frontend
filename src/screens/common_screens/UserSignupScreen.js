import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import Backbutton from "../../components/Backbutton";
import CustomModal from "../../components/CustomModal";
import { DotIndicator } from "react-native-indicators";
import { useNavigation, useRoute } from "@react-navigation/native";
import useAuth from "../../hooks/useAuth";

const UserSignupScreen = () => {
  const navigation = useNavigation();
  const { params } = useRoute();
  const initialFormData = {
    firstName: "",
    lastName: "",
    email: params.params.email,
    username: "",
    password: "",
    confirmPassword: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);
  const { isLoadingSignup, error, userSignup } = useAuth();

  const handleTogglePassword = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const isSignupDisabled = () => {
    const { firstName, lastName, username, password, confirmPassword } =
      formData;

    const hasFieldErrors = Object.values(fieldErrors).some(
      (error) => error !== ""
    );

    return (
      !firstName ||
      !lastName ||
      !username ||
      !password ||
      !confirmPassword ||
      !passwordMatch ||
      hasFieldErrors
    );
  };

  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "firstName":
        if (value.length < 2) {
          error = "First Name should be at least 2 characters long.";
        }
        break;
      case "lastName":
        if (value.length < 2) {
          error = "Last Name should be at least 2 characters long.";
        }
        break;
      case "username":
        if (value.length < 4) {
          error = "Username should be at least 4 characters long.";
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

  const handleUserSignup = async () => {
    Keyboard.dismiss();
    try {
      const credentials = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        password: formData.password,
        email: formData.email,
      };

      const isAccountCreated = await userSignup(credentials);
      if (isAccountCreated) {
        setIsModalVisible(true);
        setIsSignupSuccess(true);
        setTimeout(() => {
          setIsModalVisible(false);
          navigation.navigate("Login");
        }, 2000);
      } else {
        setIsModalVisible(false);
        setIsModalVisible(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setFormData(initialFormData);
    }
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-6 bg-white">
      <Backbutton loc="StudentVerification" />
      <Text className="text-2xl font-bold mb-6">Sign Up</Text>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
          width: 336,
          height: 600,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full mb-4">
          <Text className="text-sm font-bold mb-1">Enter First Name</Text>
          <TextInput
            className={`border focus:border-2 ${
              fieldErrors.firstName ? "border-red-500" : "border-green-500"
            } rounded-lg px-4 py-2 ${
              fieldErrors.firstName
                ? "focus:border-red-700"
                : "focus:border-green-700"
            } focus:outline-none`}
            placeholder="First Name"
            value={formData.firstName}
            onChangeText={(value) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                firstName: value,
              }))
            }
            onBlur={() => handleFieldBlur("firstName")}
          />
          {fieldErrors.firstName && (
            <Text className="text-xs text-red-500 mt-1">
              {fieldErrors.firstName}
            </Text>
          )}
        </View>

        <View className="w-full mb-4">
          <Text className="text-sm font-bold mb-1">Enter Last Name</Text>
          <TextInput
            className={`border focus:border-2 ${
              fieldErrors.lastName ? "border-red-500" : "border-green-500"
            } rounded-lg px-4 py-2 ${
              fieldErrors.lastName
                ? "focus:border-red-700"
                : "focus:border-green-700"
            } focus:outline-none`}
            placeholder="Last Name"
            value={formData.lastName}
            onChangeText={(value) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                lastName: value,
              }))
            }
            onBlur={() => handleFieldBlur("lastName")}
          />
          {fieldErrors.lastName && (
            <Text className="text-xs text-red-500 mt-1">
              {fieldErrors.lastName}
            </Text>
          )}
        </View>

        <View className="w-full mb-4">
          <Text className="text-sm font-bold mb-1">Enter username</Text>
          <TextInput
            className={`border focus:border-2 ${
              fieldErrors.username ? "border-red-500" : "border-green-500"
            } rounded-lg px-4 py-2 ${
              fieldErrors.username
                ? "focus:border-red-700"
                : "focus:border-green-700"
            } focus:outline-none`}
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
          <Text className="text-sm font-bold mb-1">Enter Password</Text>
          <View
            className={`flex-row items-center border ${
              fieldErrors.password ? "border-red-500" : "border-green-500"
            } rounded-lg px-4 py-2  ${
              fieldErrors.password
                ? "focus:border-red-700"
                : "focus:border-green-700"
            } focus:border-2`}
          >
            <TextInput
              className="flex-1 text-sm"
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
            className={`flex-row items-center border ${
              fieldErrors.confirmPassword
                ? "border-red-500"
                : "border-green-500"
            } rounded-lg px-4 py-2  ${
              fieldErrors.confirmPassword
                ? "focus:border-red-700"
                : "focus:border-green-700"
            } focus:border-2`}
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

        {isLoadingSignup ? (
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

      <View className="text-gray-700 text-sm mt-2 flex-row justify-center items-center pt-2">
        <Text clasesName="mr-1">Already have an account?</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          className="text-blue-500"
        >
          <Text style={{ color: "#34D399", fontWeight: "bold" }}>Login</Text>
        </TouchableOpacity>
      </View>
      {!isSignupSuccess ? (
        <CustomModal
          isVisible={isModalVisible}
          title="SignUp Error"
          message={error}
          buttonText={
            error === "reference number is already registered to a user"
              ? "Back to Verify Student"
              : "OK"
          }
          onButtonPress={() => {
            if (error === "reference number is already registered to a user") {
              setIsModalVisible(false);
              navigation.navigate("StudentVerification");
            } else {
              setIsModalVisible(false);
            }
          }}
        />
      ) : (
        <CustomModal
          isVisible={isModalVisible}
          title="Signup Success"
          message="Accont has been created successfully"
          showbutton={false}
        />
      )}
    </SafeAreaView>
  );
};

export default UserSignupScreen;
