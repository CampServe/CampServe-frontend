import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Backbutton from "../../components/Backbutton";
import { DotIndicator } from "react-native-indicators";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons } from "@expo/vector-icons";
import useAuth from "../../hooks/useAuth";
import { isPast } from "date-fns";

const BookServiceScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isDateTimePickerVisible, setDateTimePickerVisible] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const route = useRoute();
  const { provider } = route.params;
  const [bookingData, setBookingData] = useState({
    user_id: user.user_id,
    provider_id: provider.provider_id,
    price: "",
    paymentMode: "",
    location: "",
    scheduledDateTime: null,
  });

  const isBookingDisabled =
    Object.values(bookingData).some((value) => value === "") ||
    !bookingData.scheduledDateTime;

  const handleInputChange = (key, value) => {
    setBookingData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handlePriceChange = (text) => {
    const numericValue = text.replace(/[^0-9.]/g, ""); // Allow decimal point

    let formattedPrice = numericValue;
    if (numericValue) {
      formattedPrice = formatPrice(numericValue);
    }

    handleInputChange("price", formattedPrice);
  };

  const formatPrice = (price) => {
    const currencyString = `GH¢ ${price}`;
    return currencyString;
  };

  const handlePriceBlur = () => {
    const { price } = bookingData;

    const numericValue = price.replace(/[^0-9.]/g, ""); // Allow decimal point
    const formattedPrice = `GH¢ ${parseFloat(numericValue).toFixed(2)}`;

    handleInputChange("price", formattedPrice);
  };

  const handleDateTimePickerConfirm = (dateTime) => {
    setBookingData((prevData) => ({
      ...prevData,
      scheduledDateTime: dateTime,
    }));
    setDateTimePickerVisible(false);
  };

  const handleDateTimePickerCancel = () => {
    setDateTimePickerVisible(false);
  };

  const handleBooking = () => {
    console.log(bookingData);
  };

  return (
    <SafeAreaView className="bg-white p-6 flex-1 items-center justify-center">
      <Backbutton />
      <Text className="text-2xl font-bold mb-2">Book Service</Text>
      <Text className="text-xl font-semibold">{provider.business_name}</Text>

      <View className="relative flex-1 justify-center items-center">
        <ScrollView
          style={{ height: 110 }}
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center",
            width: 336,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="pt-4 w-full">
            <View className="w-full mb-4">
              <Text className="text-sm font-bold mb-1">Enter Agreed Price</Text>
              <View className="flex flex-row items-center border focus:border-2 border-green-500 rounded-lg px-4 py-2 focus:border-green-700 focus:outline-none">
                <TextInput
                  className="flex-1"
                  placeholder="Price"
                  value={bookingData.price}
                  onChangeText={handlePriceChange}
                  onBlur={() => handlePriceBlur(bookingData.price)}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View className="w-full mb-4">
              <Text className="text-sm font-bold mb-1">
                Agreed Mode of Payment
              </Text>
              <View className="border focus:border-2 border-green-500 rounded-lg px-4 focus:border-green-700 focus:outline-none">
                <Picker
                  selectedValue={bookingData.paymentMode}
                  style={{
                    height: 50,
                    width: "100%",
                    padding: 0,
                    margin: 0,
                    textAlign: "left",
                  }}
                  onValueChange={(itemValue) =>
                    handleInputChange("paymentMode", itemValue)
                  }
                >
                  <Picker.Item
                    label="Select Mode of Payment"
                    value=""
                    style={{ fontSize: 15, color: "gray" }}
                  />
                  <Picker.Item
                    label="Cash"
                    value="Cash"
                    style={{ fontSize: 15 }}
                  />
                  <Picker.Item
                    label="MTN Mobile Money"
                    value="MTN Mobile Money"
                    style={{ fontSize: 15 }}
                  />
                  <Picker.Item
                    label="Vodafone Cash"
                    value="Vodafone Cash"
                    style={{ fontSize: 15 }}
                  />
                </Picker>
              </View>
            </View>
            <View className="w-full mb-4">
              <Text className="text-sm font-bold mb-1">
                Where are you located?
              </Text>
              <TextInput
                className="border focus:border-2 border-green-500 rounded-lg px-4 py-2 focus:border-green-700 focus:outline-none"
                placeholder="Location"
                value={bookingData.location}
                onChangeText={(text) => handleInputChange("location", text)}
              />
            </View>
            <View className="w-full mb-4">
              <Text className="text-sm font-bold mb-1">
                Scheduled Date and Time
              </Text>
              <View className="flex-row-reverse justify-between border focus:border-2 border-green-500 rounded-lg px-4 py-3 focus:border-green-700 focus:outline-none">
                <TouchableOpacity
                  onPress={() => setDateTimePickerVisible(true)}
                >
                  <Ionicons
                    name="calendar"
                    size={16}
                    color={`${
                      bookingData.scheduledDateTime ? "green" : "gray"
                    }`}
                  />
                </TouchableOpacity>
                <Text
                  className={`${
                    bookingData.scheduledDateTime
                      ? "text-black"
                      : "text-gray-500"
                  } `}
                >
                  {bookingData.scheduledDateTime
                    ? bookingData.scheduledDateTime.toLocaleString()
                    : "Select Date and Time"}
                </Text>
              </View>
              <DateTimePickerModal
                isVisible={isDateTimePickerVisible}
                mode="datetime"
                onConfirm={handleDateTimePickerConfirm}
                onCancel={handleDateTimePickerCancel}
                minimumDate={new Date()}
              />
            </View>
          </View>
        </ScrollView>
        <View className="w-52 mt-2 justify-end">
          {isBooking ? (
            <View className="flex justify-center items-center h-10">
              <DotIndicator color="green" count={3} size={10} />
            </View>
          ) : (
            <TouchableOpacity
              className={`${
                isBookingDisabled ? "bg-gray-500" : "bg-green-500"
              } text-white py-2 px-4 w-52 rounded-lg`}
              disabled={isBookingDisabled}
              onPress={handleBooking}
            >
              <Text className="text-center text-base text-white">
                Book Service
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BookServiceScreen;
