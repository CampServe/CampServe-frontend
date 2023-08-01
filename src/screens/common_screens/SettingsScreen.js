import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import useAuth from "../../hooks/useAuth";
import { changeAccountSettings, changePassword } from "../../hooks/useApi";
import { DotIndicator } from "react-native-indicators";
import CustomModal from "../../components/CustomModal";
import jwtDecode from "jwt-decode";
import axios from "../../utils/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, setUser } = useAuth();
  const initialData = [
    {
      id: "1",
      icon: "mail",
      label: "Email",
      value: user.email,
      editing: false,
    },
    {
      id: "2",
      icon: "person",
      label: "Username",
      value: user.username,
      editing: false,
      placeholder: "Enter new username",
      inputKey: "newUsername",
    },
    {
      id: "3",
      icon: "person",
      label: "First Name",
      value: user.first_name,
      editing: false,
      placeholder: "Enter new first name",
      inputKey: "newFirstname",
    },
    {
      id: "4",
      icon: "person",
      label: "Last Name",
      value: user.last_name,
      editing: false,
      placeholder: "Enter new last name",
      inputKey: "newLastname",
    },
    {
      id: "5",
      icon: "lock-closed",
      label: "Password",
      value: "**********",
      editing: false,
      inputKey: "oldPassword",
      placeholder: "Enter old password",
      secureTextEntry: true,
      subInputs: [
        {
          label: "New Password",
          placeholder: "Enter new password",
          inputKey: "newPassword",
          secureTextEntry: true,
        },
        {
          label: "Confirm Password",
          placeholder: "Confirm new password",
          inputKey: "confirmPassword",
          secureTextEntry: true,
        },
      ],
    },
  ];
  const initialFormData = {
    newUsername: "",
    newFirstname: "",
    newLastname: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [settingsData, setSettingsData] = useState(initialData);
  const [inputErrors, setInputErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [settingsId, setSettingsId] = useState(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [isSaveFieldComplete, setIsSaveFieldComplete] = useState(false);

  useEffect(() => {
    if (!isSaveFieldComplete) {
      const updatedData = initialData.map((item) => {
        switch (item.label) {
          case "Email":
            return { ...item, value: user.email };
          case "Username":
            return { ...item, value: user.username };
          case "First Name":
            return { ...item, value: user.first_name };
          case "Last Name":
            return { ...item, value: user.last_name };
          default:
            return item;
        }
      });
      setSettingsData(updatedData);
    }
  }, [user, isSaveFieldComplete]);

  const validateField = (fieldId) => {
    let error = null;

    switch (fieldId) {
      case "2":
        if (formData.newUsername && formData.newUsername.length < 4) {
          error = "Username must be at least 4 characters long";
        } else if (formData.newUsername.length === 0) {
          error = "Field cannot be empty";
        }
        break;
      case "3":
        if (formData.newFirstname && formData.newFirstname.length < 2) {
          error = "First name must be at least 2 characters long";
        } else if (formData.newFirstname.length === 0) {
          error = "Field cannot be empty";
        }

        break;
      case "4":
        if (formData.newLastname && formData.newLastname.length < 2) {
          error = "Last name must be at least 2 characters long";
        } else if (formData.newLastname.length === 0) {
          error = "Field cannot be empty";
        }
        break;
      case "5":
        if (formData.newPassword && formData.newPassword.length < 5) {
          error = "New password must be at least 5 characters long";
        } else if (formData.confirmPassword !== formData.newPassword) {
          error = "Confirm password does not match the new password";
        } else if (
          formData.oldPassword.length === 0 ||
          formData.newPassword.length === 0 ||
          formData.confirmPassword.length === 0
        ) {
          error = "Field cannot be empty";
        }
        break;
      default:
        break;
    }

    if (error !== null) {
      setInputErrors({ ...inputErrors, [fieldId]: error });
    } else {
      const { [fieldId]: removedError, ...updatedErrors } = inputErrors;
      setInputErrors(updatedErrors);
    }

    return !error;
  };

  const handleSaveField = async (fieldId) => {
    setIsLoading(true);
    setSettingsId(fieldId);
    setIsSaveFieldComplete(true);
    const isFieldValid = validateField(fieldId);
    if (!isFieldValid) {
      setTimeout(() => {
        setInputErrors({});
      }, 5000);
      return;
    }

    switch (fieldId) {
      case "2":
        const usernameData = {
          user_id: user.user_id,
          ...(user.provider_id && { provider_id: user.provider_id }),
          username: formData.newUsername,
        };
        try {
          const tokenResponse = await changeAccountSettings(usernameData);
          const tokenData = tokenResponse.token;
          if (tokenData) {
            const response = jwtDecode(tokenData);

            const { expiration, ...userData } = response;
            axios.defaults.headers.common["Authorization"] = `${tokenData}`;
            try {
              await AsyncStorage.setItem("token", tokenData);
            } catch (storageError) {
              console.log("Error storing token in AsyncStorage:", storageError);
            }

            setUser(userData);
          } else {
            console.log(response);
          }
        } catch (error) {
          console.log(error);
        }
        break;
      case "3":
        const firstnameData = {
          user_id: user.user_id,
          ...(user.provider_id && { provider_id: user.provider_id }),
          first_name: formData.newFirstname,
        };
        try {
          const tokenResponse = await changeAccountSettings(firstnameData);
          const tokenData = tokenResponse.token;
          if (tokenData) {
            const response = jwtDecode(tokenData);

            const { expiration, ...userData } = response;
            axios.defaults.headers.common["Authorization"] = `${tokenData}`;
            try {
              await AsyncStorage.setItem("token", tokenData);
            } catch (storageError) {
              console.log("Error storing token in AsyncStorage:", storageError);
            }

            setUser(userData);
          } else {
            console.log(response);
          }
        } catch (error) {
          console.log(error);
        }
        break;
      case "4":
        const lastnameData = {
          user_id: user.user_id,
          ...(user.provider_id && { provider_id: user.provider_id }),
          last_name: formData.newLastname,
        };
        try {
          const tokenResponse = await changeAccountSettings(lastnameData);
          const tokenData = tokenResponse.token;
          if (tokenData) {
            const response = jwtDecode(tokenData);

            const { expiration, ...userData } = response;
            axios.defaults.headers.common["Authorization"] = `${tokenData}`;
            try {
              await AsyncStorage.setItem("token", tokenData);
            } catch (storageError) {
              console.log("Error storing token in AsyncStorage:", storageError);
            }

            setUser(userData);
          } else {
            console.log(response);
          }
        } catch (error) {
          console.log(error);
        }
        break;
      case "5":
        const passwordData = {
          user_id: user.user_id,
          old_password: formData.oldPassword,
          new_password: formData.newPassword,
        };
        try {
          const response = await changePassword(passwordData);
          if (response.message === "Password reset successful") {
            setIsSuccessModalVisible(true);
            setTitle("Password change successful");
            setMessage("Password change was successful");
          } else if (response.error === "Old password does not match") {
            setIsSuccessModalVisible(true);
            setTitle("Password change failed");
            setMessage(response.error);
          }
        } catch (error) {
          console.log(error);
        } finally {
        }
        break;
      default:
        break;
    }
    setIsLoading(false);
    setSettingsId(null);
    saveField(fieldId);
    setIsSaveFieldComplete(false);
  };

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const saveField = (id) => {
    setFormData({});
    const updatedData = settingsData.map((setting) =>
      setting.id === id ? { ...setting, editing: false } : setting
    );
    setSettingsData(updatedData);
  };

  const handleEditing = (id) => {
    const updatedData = settingsData.map((setting) =>
      setting.id === id ? { ...setting, editing: true } : setting
    );
    setSettingsData(updatedData);
  };

  const togglePasswordVisibility = (fieldId, subInputKey) => {
    setSettingsData((prevData) =>
      prevData.map((setting) =>
        setting.id === fieldId
          ? {
              ...setting,
              ...(subInputKey
                ? {
                    subInputs: setting.subInputs.map((subInput) =>
                      subInput.inputKey === subInputKey
                        ? {
                            ...subInput,
                            secureTextEntry: !subInput.secureTextEntry,
                          }
                        : subInput
                    ),
                  }
                : { secureTextEntry: !setting.secureTextEntry }),
            }
          : setting
      )
    );
  };

  const renderSettingItem = ({ item }) => {
    const showError =
      inputErrors[item.id] !== undefined && inputErrors[item.id] !== null;
    const errorMessage = showError ? inputErrors[item.id] : "";

    return (
      <View
        className="mx-2 mt-1"
        style={{
          padding: 16,
          backgroundColor: "white",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
          marginBottom: 16,
          borderRadius: 12,
        }}
      >
        <View className="flex-row justify-between">
          <View className="flex-row">
            <Ionicons
              name={item.icon}
              size={16}
              color="gray"
              style={{
                backgroundColor: "#D1D5DB",
                borderRadius: 20,
                padding: 3,
              }}
            />
            <Text className="ml-2 text-gray-400 font-bold">{item.label}</Text>
          </View>

          {item.label !== "Email" &&
            (!item.editing ? (
              <TouchableOpacity onPress={() => handleEditing(item.id)}>
                <Ionicons name="create-outline" size={22} color="gray" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => saveField(item.id)}>
                <Ionicons name="close-circle-outline" size={22} color="gray" />
              </TouchableOpacity>
            ))}
        </View>
        {item.editing ? (
          <View className="mt-2">
            {item.inputKey === "oldPassword" ? (
              <View className="flex-row border-b border-gray-500 focus:border-gray-900 mr-2 ml-7 pl-1 rounded-md mb-2">
                <TextInput
                  className="pr-1 flex-1"
                  value={formData[item.inputKey]}
                  onChangeText={(text) =>
                    handleInputChange(item.inputKey, text)
                  }
                  placeholder={item.placeholder}
                  autoFocus
                  secureTextEntry={item.secureTextEntry}
                />
                <TouchableOpacity
                  onPress={() => togglePasswordVisibility(item.id)}
                >
                  <Ionicons
                    name={
                      item.secureTextEntry ? "eye-outline" : "eye-off-outline"
                    }
                    size={22}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TextInput
                  className="border-b border-gray-500 focus:border-gray-900 mr-2 ml-7 pl-1 rounded-md flex-1 mb-2"
                  value={formData[item.inputKey]}
                  onChangeText={(text) =>
                    handleInputChange(item.inputKey, text)
                  }
                  placeholder={item.placeholder}
                  autoFocus
                  secureTextEntry={item.secureTextEntry}
                />
              </>
            )}
            {item.subInputs &&
              item.subInputs.map((subInput) => (
                <View className="flex-row border-b border-gray-500 focus:border-gray-900 pb-1 mt-2 ml-7 pl-1 rounded-md mr-2 mb-2">
                  <TextInput
                    key={subInput.label}
                    className="pr-1 flex-1"
                    value={formData[subInput.inputKey]}
                    onChangeText={(text) =>
                      handleInputChange(subInput.inputKey, text)
                    }
                    placeholder={subInput.placeholder}
                    secureTextEntry={subInput.secureTextEntry}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      togglePasswordVisibility(item.id, subInput.inputKey)
                    }
                  >
                    <Ionicons
                      name={
                        subInput.secureTextEntry
                          ? "eye-outline"
                          : "eye-off-outline"
                      }
                      size={22}
                      color="gray"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            {showError && (
              <Text className="ml-8 text-red-500 text-[11px] mb-2">
                {errorMessage}
              </Text>
            )}
            <View className="flex-row items-center justify-end">
              {isLoading && item.id == settingsId ? (
                <View className="justify-end px-4 py-2">
                  <DotIndicator color="green" count={3} size={5} />
                </View>
              ) : (
                <TouchableOpacity
                  className={`justify-center items-center bg-green-500 p-1 px-4 py-2 rounded-xl`}
                  onPress={() => handleSaveField(item.id)}
                >
                  <Text className="ml-2">Save</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <Text className="mt-2 ml-8 text-gray-600">{item.value}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <CustomHeader
        GoBack={() => navigation.goBack()}
        showBackIcon={true}
        title="Account Settings"
      />
      <FlatList
        data={settingsData}
        renderItem={renderSettingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle="py-4"
      />
      <CustomModal
        isVisible={isSuccessModalVisible}
        onClose={() => setIsSuccessModalVisible(false)}
        title={title}
        message={message}
        buttonText="OK"
        onButtonPress={() => setIsSuccessModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default SettingsScreen;
