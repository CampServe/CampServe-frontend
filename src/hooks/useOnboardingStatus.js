import { useEffect, useState, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useOnboardingStatus = () => {
  const [completedOnboarding, setCompletedOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem("onboardingCompleted");
      if (value !== null && value === "true") {
        setCompletedOnboarding(true);
      }
    } catch (error) {
      console.log("Error reading onboarding status:", error);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("onboardingCompleted", "true");
      setCompletedOnboarding(true);
    } catch (error) {
      console.log("Error storing onboarding status:", error);
    }
  };

  const memoizedValue = useMemo(
    () => ({
      completedOnboarding,
      completeOnboarding,
      loading,
    }),
    [completedOnboarding, loading]
  );

  return memoizedValue;
};

export default useOnboardingStatus;
