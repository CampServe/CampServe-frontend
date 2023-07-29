import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import CustomHeader from "../../components/CustomHeader";
import { Ionicons } from "@expo/vector-icons";

const faqs = [
  {
    question: "What is this app about?",
    answer:
      "This app is a comprehensive multi-service platform designed to cater to the needs of students and users from various backgrounds. It offers a wide range of services, including but not limited to booking services, payment processing, and a chat system for easy communication with service providers.",
  },
  {
    question: "How do I become a service provider?",
    answer:
      "To become a service provider on our app, you first need to register as a student or user. Once registered, you can switch to the service provider role through your profile settings. You'll need to provide necessary information, such as your business name, bio, contact and the services you offer.",
  },
  {
    question: "How does the booking system work?",
    answer:
      "Our booking system is designed to be user-friendly and efficient. Users can browse through the available services and select the one they need. They can then choose a suitable date and time for the service, and the request will be sent to the service provider. The service provider will review the request and either accept or decline it. If accepted, the booking will be confirmed and the booking process",
  },
  {
    question: "What payment methods do you support?",
    answer:
      "We offer a secure and convenient payment system integrated with Hubtel. Users can pay for the services they book directly through the app using various payment methods, mtn momo and vodafone cash. Rest assured that all transactions are encrypted and follow strict security protocols.",
  },
  {
    question: "How do I use the chat system to communicate with providers?",
    answer:
      "The chat system provides a seamless way for users and service providers to communicate. Before a booking is confirmed, a chat system is available, allowing users to ask questions, share details, and discuss any specific requirements with the service provider. This helps users make informed decisions and ensures a smooth service experience.",
  },
  {
    question: "Is my personal information safe on this platform?",
    answer:
      "Absolutely! We take data privacy and security seriously. Your personal information is stored securely and treated with the utmost confidentiality. We follow industry best practices to safeguard user data and our app complies with data protection regulations.",
  },
  {
    question: "What happens if a service provider cancels my booking?",
    answer:
      "In the rare event of a service provider canceling a booking, we understand how inconvenient it can be for users. Our platform encourages professionalism and such occurrences are actively monitored.",
  },
  {
    question: "Can I leave a review for the service I received?",
    answer:
      "Yes, we encourage users to share their experiences by leaving reviews for the services they receive. Your feedback helps us maintain service quality and enables other users to make well-informed choices when booking services.",
  },
  {
    question: "Is there a support team I can contact if I have issues?",
    answer:
      "Absolutely! Our dedicated support team is available to assist you with any concerns or issues you may have. You can contact our support through the app's help center or by emailing isinesam@gmail.com. We aim to respond promptly to ensure a seamless user experience.",
  },
  {
    question: "Are there any additional features I should be aware of?",
    answer:
      "Yes, our app offers several other features to enhance your experience. For example, users can save their favorite service providers, access past booking history, and receive personalized recommendations based on their preferences. We continuously update and improve our app to meet user needs.",
  },
];

const FaqAccordionItem = ({ faq }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleAccordion = () => {
    setExpanded(!expanded);
  };

  return (
    <View className="mb-4">
      <TouchableOpacity onPress={toggleAccordion} activeOpacity={0.8}>
        <View
          className="bg-white rounded-lg p-3 mx-[2px] mt-[2px] flex-row justify-between items-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Text className="flex-1 text-gray-700 text-[14px] font-semibold">
            {faq.question}
          </Text>
          <Ionicons
            name={expanded ? "remove-outline" : "add-outline"}
            size={24}
            color="black"
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View
          className="p-3 mx-1 mt-1 bg-white rounded-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Text className="text-gray-500">{faq.answer}</Text>
        </View>
      )}
    </View>
  );
};

const HelpsAndFaqsScreen = () => {
  const navigation = useNavigation();
  const [showContact, setShowContact] = useState(false);

  const toggleContact = () => {
    setShowContact(!showContact);
  };

  const handleCallSupport = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleEmailSupport = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <CustomHeader
        GoBack={() => navigation.goBack()}
        showBackIcon={true}
        title="Help And FAQs"
      />
      <View className="flex-1">
        <ScrollView className="flex-1">
          {faqs.map((faq, index) => (
            <FaqAccordionItem key={index} faq={faq} />
          ))}
        </ScrollView>

        <TouchableOpacity
          onPress={toggleContact}
          activeOpacity={0.6}
          className={`p-4 ${
            !showContact ? "my-2" : "my-0"
          } bg-gray-300 flex-row justify-between`}
        >
          <Text className="text-gray-700 text-lg font-bold">
            Contact Support
          </Text>
          <Ionicons
            name={showContact ? "chevron-down" : "chevron-up"}
            size={24}
          />
        </TouchableOpacity>

        {showContact && (
          <View className={`bg-gray-100 p-2 mb-2 space-y-[1px] rounded-lg`}>
            <TouchableOpacity
              onPress={() => handleCallSupport("+233 551429980")}
              className="flex-row items-center gap-4"
            >
              <Ionicons name="call-outline" size={24} />
              <Text className="text-gray-500 text-lg">+233 551429980</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleEmailSupport("isinesam@gmail.com")}
              className="flex-row items-center gap-4"
            >
              <Ionicons name="mail-outline" size={24} />
              <Text className="text-gray-500 text-lg">isinesam@gmail.com</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default HelpsAndFaqsScreen;
