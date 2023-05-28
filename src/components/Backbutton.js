import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const Backbutton = () => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
      <Icon name="arrow-back" size={24} />
    </TouchableOpacity>
  );
};

export default Backbutton;

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },
});
