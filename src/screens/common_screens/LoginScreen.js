import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Icon } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import { DotIndicator } from "react-native-indicators";
import useAuth from "../../hooks/useAuth";
import CustomModal from "../../components/CustomModal";

const LoginScreen = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isServiceProviderLogin, setIsServiceProviderLogin] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { isLoadingLogin, login, error } = useAuth();
  const navigation = useNavigation();

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    const credentials = {
      username: formData.username,
      password: formData.password,
    };

    try {
      const AccountLoggedIn = await login(credentials, isServiceProviderLogin);
      if (!AccountLoggedIn) {
        setIsModalVisible(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setFormData({ username: "", password: "" });
    }
  };

  const handleToggleLoginType = () => {
    setIsServiceProviderLogin(!isServiceProviderLogin);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isLoginDisabled = !formData.username || !formData.password;

  return (
    // <SafeAreaView>
    <KeyboardAvoidingView
      className="flex-1 items-center justify-center space-y-4 p-6 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text className="text-2xl font-bold mb-6">
        {!isServiceProviderLogin ? "User Login" : "Service Provider Login"}
      </Text>

      <View className="items-center justify-center w-full">
        <View className="w-full mb-4">
          <Text className="text-sm font-bold mb-1">Enter school username</Text>
          <TextInput
            className="border focus:border-2 border-green-500 rounded-lg px-4 py-2 focus:border-green-700 focus:outline-none"
            placeholder="Username"
            value={formData.username}
            onChangeText={(username) => setFormData({ ...formData, username })}
          />
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
              onChangeText={(password) =>
                setFormData({ ...formData, password })
              }
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <Icon
                name={showPassword ? "eye-off" : "eye"}
                type="ionicon"
                size={20}
                color="#555"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="w-72">
        {isLoadingLogin ? (
          <View className="flex justify-center items-center h-10">
            <DotIndicator color="green" count={3} size={10} />
          </View>
        ) : (
          <>
            <View className="flex-col gap-4 items-center justify-end ">
              <TouchableOpacity
                className={`${
                  !isLoginDisabled ? "bg-green-500" : "bg-gray-500"
                } text-white py-2 px-4 w-72 rounded-lg`}
                onPress={handleLogin}
                disabled={isLoginDisabled}
              >
                <Text className="text-center text-base text-white">Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-green-800 text-gray-700 py-2 px-4 w-72 rounded-lg"
                onPress={handleToggleLoginType}
              >
                <Text className="text-center text-base text-white">
                  Switch to{" "}
                  {isServiceProviderLogin
                    ? "User Login"
                    : "Service Provider Login"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <View className="text-gray-700 text-sm mt-4 flex-row justify-center items-center pt-4">
        <Text>Don't have an account?</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("StudentVerification")}
        >
          <Text style={{ color: "#34D399", fontWeight: "bold" }}>
            {" "}
            Sign up{" "}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <CustomModal
          isVisible={isModalVisible}
          title="Login Error"
          message={error}
          buttonText="OK"
          onButtonPress={handleCloseModal}
          onClose={handleCloseModal}
        />
      )}
    </KeyboardAvoidingView>
    // </SafeAreaView>
  );
};

export default LoginScreen;
