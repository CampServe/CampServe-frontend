import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuth from "../../hooks/useAuth";
import { useNavigation } from "@react-navigation/native";
import Backbutton from "../../components/Backbutton";

const SProfileSetup = () => {
  const navigation = useNavigation();
  const initialFormData = {
    business_name: "",
    bio: "",
    provider_contact: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "business_name":
        if (value.trim().length < 5) {
          error = "First Name should be at least 5 characters long.";
        }
        break;
      case "bio":
        if (value.trim().length < 10) {
          error = "Bio should be at least 10 characters long.";
        }
        break;
      case "provider_contact":
        if (!/^[0][0-9]{9}$/.test(value)) {
          error = "Contact number should be a 10-digit number starting with 0.";
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

  const isNextDisabled = () => {
    const { business_name, bio, provider_contact } = formData;

    const hasFieldErrors = Object.values(fieldErrors).some(
      (error) => error !== ""
    );

    return !business_name || !bio || !provider_contact || hasFieldErrors;
  };

  const handleNextPress = () => {
    handleFieldBlur("business_name");
    handleFieldBlur("bio");
    handleFieldBlur("provider_contact");
    Keyboard.dismiss();

    const hasFieldErrors = Object.values(fieldErrors).some(
      (error) => error !== ""
    );

    if (!hasFieldErrors) {
      navigation.navigate("SelectCategories", { formData });
    }
  };

  return (
    <SafeAreaView className="flex-1 items-center p-6 bg-white">
      <Backbutton />
      <View className=" flex-1 items-center justify-center w-full">
        <Text className="text-2xl font-bold mb-6">Profile Setup</Text>
        <View className="w-full mb-4">
          <Text className="text-sm font-bold mb-1">Enter Business Name</Text>
          <TextInput
            className={`border focus:border-2 ${
              fieldErrors.business_name ? "border-red-500" : "border-green-500"
            } rounded-lg px-4 py-2 ${
              fieldErrors.business_name
                ? "focus:border-red-700"
                : "focus:border-green-700"
            } focus:outline-none`}
            placeholder="Business Name"
            value={formData.business_name}
            onChangeText={(value) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                business_name: value,
              }))
            }
            onBlur={() => handleFieldBlur("business_name")}
          />
          {fieldErrors.business_name && (
            <Text className="text-xs text-red-500 mt-1">
              {fieldErrors.business_name}
            </Text>
          )}
        </View>

        <View className="w-full mb-4">
          <Text className="text-sm font-bold mb-1">Enter Bio</Text>
          <TextInput
            className={`border focus:border-2 ${
              fieldErrors.bio ? "border-red-500" : "border-green-500"
            } rounded-lg px-4 py-2 ${
              fieldErrors.bio
                ? "focus:border-red-700"
                : "focus:border-green-700"
            } focus:outline-none`}
            placeholder="Bio"
            multiline={true}
            numberOfLines={6}
            value={formData.bio}
            onChangeText={(value) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                bio: value,
              }))
            }
            textAlignVertical="top"
            onBlur={() => handleFieldBlur("bio")}
          />
          {fieldErrors.bio && (
            <Text className="text-xs text-red-500 mt-1">{fieldErrors.bio}</Text>
          )}
        </View>

        <View className="w-full mb-4">
          <Text className="text-sm font-bold mb-1">Enter Contact Number</Text>
          <TextInput
            className={`border focus:border-2 ${
              fieldErrors.provider_contact
                ? "border-red-500"
                : "border-green-500"
            } rounded-lg px-4 py-2 ${
              fieldErrors.provider_contact
                ? "focus:border-red-700"
                : "focus:border-green-700"
            } focus:outline-none`}
            placeholder="Contact number"
            keyboardType="number-pad"
            maxLength={10}
            value={formData.provider_contact}
            onChangeText={(value) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                provider_contact: value,
              }))
            }
            onBlur={() => handleFieldBlur("provider_contact")}
          />
          {fieldErrors.provider_contact && (
            <Text className="text-xs text-red-500 mt-1">
              {fieldErrors.provider_contact}
            </Text>
          )}
        </View>
      </View>
      <View className="mb-6">
        <TouchableOpacity
          className={`${
            isNextDisabled() ? "bg-gray-500" : "bg-green-500"
          } w-52 text-white py-2 px-4 rounded-lg mt-4`}
          disabled={isNextDisabled()}
          onPress={handleNextPress}
        >
          <Text className="text-center text-base text-white">Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SProfileSetup;
