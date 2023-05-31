import React, { useState, useEffect } from "react";
import {
  Image,
  View,
  Text,
  Button,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import useOnboardingStatus from "../../hooks/useOnboardingStatus";

const OnboardingScreen = ({ onComplete }) => {
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
      title: "Welcome to MyApp!",
      description: "Discover a world of possibilities.",
      image: require("../../../assets/onboarding1.jpg"),
    },
    {
      title: "Explore",
      description: "Find what interests you with ease.",
      image: require("../../../assets/onboarding2.jpg"),
    },
    {
      title: "Connect",
      description: "Connect with friends and loved ones.",
      image: require("../../../assets/onboarding3.jpg"),
    },
    {
      title: "Get Started",
      description: "Join our community and start exploring!",
      image: require("../../../assets/onboarding4.jpg"),
    },
  ];

  const currentScreen = onboardingScreens[activeScreenIndex];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

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
          <Text className="text-2xl font-bold mb-2">{currentScreen.title}</Text>
          <Text className="text-lg mb-6">{currentScreen.description}</Text>
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
