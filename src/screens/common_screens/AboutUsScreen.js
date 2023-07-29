import { View, Text, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native";

const aboutUsData = [
  {
    name: "John Doe",
    image:
      "https://thumbs.dreamstime.com/b/user-profile-avatar-icon-134114304.jpg",
    description:
      "Final year student pursuing Computer Engineering at KNUST. Passionate about creating innovative solutions to real-world problems.",
  },
  {
    name: "Jane Smith",
    image:
      "https://thumbs.dreamstime.com/b/user-profile-avatar-icon-134114304.jpg",
    description:
      "Computer Engineering student at KNUST. Enthusiastic about software development and enhancing user experiences.",
  },
  {
    name: "Michael Johnson",
    image:
      "https://thumbs.dreamstime.com/b/user-profile-avatar-icon-134114304.jpg",
    description:
      "Dedicated Computer Engineering student at KNUST. Keen on developing scalable and user-friendly applications.",
  },
];

const AboutUsScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <CustomHeader
        GoBack={() => navigation.goBack()}
        showBackIcon={true}
        title="About Us"
      />

      <ScrollView className="flex-1 p-4">
        <ScrollView horizontal className="">
          {aboutUsData.map((data, index) => (
            <View key={index} className="flex items-center mb-6">
              <Image
                source={{ uri: data.image }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 60,
                  marginBottom: 10,
                }}
              />
              <Text className="text-lg font-bold mb-2">{data.name}</Text>
              {/* <Text className="text-lg">{data.description}</Text> */}
            </View>
          ))}
        </ScrollView>

        <Text className="text-lg">
          Our mission is to bridge the gap between students and essential
          services by providing a user-friendly and secure platform that
          facilitates smooth interactions between students and service
          providers. Through our app, we aim to empower students and enhance
          their overall campus experience.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutUsScreen;
