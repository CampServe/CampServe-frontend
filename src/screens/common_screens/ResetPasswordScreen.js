import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState } from "react";
import ScreenWithBackground from "../../components/ScreenWithBackground";
import { DotIndicator } from "react-native-indicators";
import Icon from "react-native-vector-icons/Ionicons";
import Backbutton from "../../components/Backbutton";

const ResetPasswordScreen = () => {
  const [isLoadingReset, setIsLoadingReset] = useState(false);
  const initialFormData = {
    password: "",
    confirmPassword: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleTogglePassword = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const isResetDisabled = () => {
    const { password, confirmPassword } = formData;

    const hasFieldErrors = Object.values(fieldErrors).some(
      (error) => error !== ""
    );

    return !password || !confirmPassword || hasFieldErrors;
  };

  const validateField = (field, value) => {
    let error = "";

    switch (field) {
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

  return (
    <ScreenWithBackground>
      <KeyboardAvoidingView
        className="flex-1 items-center justify-center space-y-4 p-6"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Backbutton />
        <Image
          source={require("../../../assets/CampServe.png")}
          style={{ width: 150, height: 50 }}
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold">Reset Password</Text>
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

        <View className="w-72">
          {isLoadingReset ? (
            <View className="flex justify-center items-center h-10">
              <DotIndicator color="green" count={3} size={10} />
            </View>
          ) : (
            <>
              <View className="flex-col gap-4 items-center justify-end ">
                <TouchableOpacity
                  className={`${
                    !isResetDisabled() ? "bg-green-500" : "bg-gray-500"
                  } text-white py-2 px-4 w-72 rounded-lg`}
                  // onPress={handleLogin}
                  disabled={isResetDisabled()}
                >
                  <Text className="text-center text-base text-white">
                    Reset Password
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* {error && (
          <CustomModal
            isVisible={isModalVisible}
            title="Login Error"
            message={error}
            buttonText="OK"
            onButtonPress={handleCloseModal}
            onClose={handleCloseModal}
          />
        )} */}
      </KeyboardAvoidingView>
    </ScreenWithBackground>
  );
};

export default ResetPasswordScreen;
