import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CustomCard = ({
  image,
  businessName,
  bio,
  contactNumber,
  ratings,
  onPress,
}) => {
  const MAX_BIO_LENGTH = 25;

  const truncatedBio =
    bio.length > MAX_BIO_LENGTH ? `${bio.slice(0, MAX_BIO_LENGTH)}...` : bio;

  const truncatedbusinessName =
    businessName.length > MAX_BIO_LENGTH
      ? `${bio.slice(0, MAX_BIO_LENGTH)}...`
      : businessName;

  return (
    <TouchableOpacity
      className="flex flex-1"
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: "white",
        borderRadius: 8,
        // padding: 8,
        margin: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        width: 250,
        height: 250,
      }}
    >
      <View className="flex-1 h-1/2">
        <Image
          source={image}
          style={{
            flex: 1,
            width: "100%",
            height: undefined,
            // aspectRatio: 2,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
          resizeMode="contain"
        />
      </View>
      <View className="flex-1 pb-4 px-4 h-1/2">
        <Text
          className="capitalize"
          style={{ fontSize: 20, fontWeight: "bold", marginTop: 8 }}
        >
          <Ionicons name="business-outline" size={20} color="#0A4014" />{" "}
          {truncatedbusinessName}
        </Text>
        <Text className="capitalize" style={{ color: "gray", marginTop: 8 }}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#0A4014"
          />{" "}
          {truncatedBio}
        </Text>
        <Text style={{ color: "gray", marginTop: 8 }}>
          <Ionicons name="call-outline" size={20} color="#0A4014" />{" "}
          {contactNumber}
        </Text>
        <Text style={{ color: "gray", marginTop: 8 }}>
          <Ionicons name="star" size={20} color="gold" /> {ratings || "N/A"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CustomCard;
