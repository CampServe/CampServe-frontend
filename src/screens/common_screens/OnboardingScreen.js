import React, { useState, useEffect } from "react";
import { Image, View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import useOnboardingStatus from "../../hooks/useOnboardingStatus";
import Loader from "../../components/Loader";
import * as SplashScreen from "expo-splash-screen";
import { ImageBackground } from "react-native";

const OnboardingScreen = () => {
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const { completedOnboarding, completeOnboarding, loading } =
    useOnboardingStatus();
  const navigation = useNavigation();

  useEffect(() => {
    if (completedOnboarding) {
      navigation.replace("Login");
    }
  }, [completedOnboarding, navigation]);

  const handleOnboardingComplete = () => {
    completeOnboarding();
    navigation.replace("Login");
  };

  const onSkip = () => {
    handleOnboardingComplete();
  };

  const onNext = () => {
    const nextIndex = activeScreenIndex + 1;
    if (nextIndex < onboardingScreens.length) {
      setActiveScreenIndex(nextIndex);
    } else {
      handleOnboardingComplete();
    }
  };

  const onboardingScreens = [
    {
      title: "Welcome to CampServe!",
      description:
        "Your All-In-One Campus Service Platform designed to make your life easier as a student.",
      image: require("../../../assets/onboarding1.jpg"),
    },
    {
      title: "Services Overview",
      description:
        "Discover a wide range of services at your fingertips. From booking services to seamless payment processing and chat support, we've got you covered.",
      image: require("../../../assets/onboarding2.jpg"),
    },
    {
      title: "How It Works",
      description:
        "Becoming a service provider is easy. Just sign up as a student and start offering your services. Our streamlined booking and payment systems make accessing essential services a breeze.",
      image: require("../../../assets/onboarding3.jpg"),
    },
    {
      title: "Benefits for Students",
      description:
        "Experience the convenience of accessing various services from a single platform. Enjoy seamless interactions with providers and get exclusive offers and rewards as a regular user.",
      image: require("../../../assets/sub2.jpg"),
    },
    {
      title: "Get Started",
      description:
        "Ready to explore? Sign up or log in now to begin your journey with CampServe.",
      image: require("../../../assets/onboarding4.jpg"),
    },
  ];

  if (loading) {
    return <Loader />;
  }

  const currentScreen = onboardingScreens[activeScreenIndex];

  return (
    <View className="flex-1 bg-white">
      <View className="h-1/2">
        <Image
          source={currentScreen.image}
          style={{ flex: 1, width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>

      <View className="h-1/2 p-6">
        <View className="items-center justify-center h-1/2">
          <Text className="text-2xl text-center font-bold mb-2">
            {currentScreen.title}
          </Text>
          <Text className="text-lg text-center mb-6">
            {currentScreen.description}
          </Text>
        </View>

        <View className="flex-col items-center justify-center h-1/2">
          {activeScreenIndex < onboardingScreens.length - 1 ? (
            <>
              <TouchableOpacity
                activeOpacity={0.5}
                className="bg-green-500 text-white py-2 px-4 mb-4 w-64 rounded-2xl"
                onPress={onNext}
              >
                <Text className="text-center text-2xl text-white">Next</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.5}
                className="bg-white border border-gray-300 py-2 px-4 w-64 rounded-2xl"
                onPress={onSkip}
              >
                <Text className="text-center text-2xl text-black">Skip</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              activeOpacity={0.5}
              className="bg-green-500 text-white py-2 px-4 w-64 rounded-2xl"
              onPress={handleOnboardingComplete}
            >
              <Text className="text-center text-2xl text-white">
                Get Started
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="flex flex-row items-center justify-center mt-2">
          {onboardingScreens.map((screen, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === activeScreenIndex ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default OnboardingScreen;
