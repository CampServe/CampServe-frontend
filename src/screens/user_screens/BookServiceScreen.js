import {
  ActivityIndicator,
  View,
  Text,
  Keyboard,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Backbutton from "../../components/Backbutton";
import { DotIndicator } from "react-native-indicators";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons } from "@expo/vector-icons";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import useAuth from "../../hooks/useAuth";
import { GOOGLE_MAPS_API_KEY } from "@env";
import BookingTipsModal from "../../components/BookingTipsModal";
import * as Animatable from "react-native-animatable";
import { bookService } from "../../hooks/useApi";
import Modal from "react-native-modal";

const BookServiceScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isDateTimePickerVisible, setDateTimePickerVisible] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const route = useRoute();
  const { provider } = route.params;
  const [bookingData, setBookingData] = useState({
    subcategory: provider.sub_categories,
    user_id: user.user_id,
    provider_id: provider.provider_id,
    price: "",
    paymentMode: "",
    location: "",
    scheduledDateTime: null,
  });
  const googlePlacesAutocompleteRef = useRef(null);
  const [isLocationEmpty, setIsLocationEmpty] = useState(true);
  const [isLocationUnavailable, setIsLocationUnavailable] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const animationRef = useRef(null);

  const handleCancel = () => {
    setIsConfirmationModalVisible(false);
  };

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      const success = await bookService(bookingData);
      setIsSuccess(success);
      setIsSuccessModalVisible(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsConfirming(false);
      setIsModalVisible(false);
      setBookingData({
        subcategory: provider.sub_categories,
        user_id: user.user_id,
        provider_id: provider.provider_id,
        price: "",
        paymentMode: "",
        location: "",
        scheduledDateTime: null,
      });
    }
  };

  useEffect(() => {
    let timeout;

    if (isSuccessModalVisible) {
      timeout = setTimeout(() => {
        navigation.navigate("ServiceDetails", {
          provider,
          bookingData: bookingData.user_id,
        });
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [isSuccessModalVisible, navigation]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleCautionClick = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const isBookingDisabled =
    Object.values(bookingData).some((value) => value === "") ||
    !bookingData.scheduledDateTime;

  const handleInputChange = (key, value) => {
    setBookingData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handlePriceChange = (text) => {
    const numericValue = text.replace(/[^0-9.]/g, "");

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
    if (price.length == 0) {
      return;
    }

    const numericValue = price.replace(/[^0-9.]/g, "");
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
    setIsConfirmationModalVisible(true);
  };

  return (
    <SafeAreaView className="bg-white p-6 flex-1 items-center justify-center">
      <Backbutton />
      <Text className="text-2xl font-bold mb-2">Book Service</Text>
      <Text className="text-xl font-semibold capitalize">
        {provider.business_name}
      </Text>

      <View className="relative flex-1 flex items-center">
        <FlatList
          keyboardShouldPersistTaps="handled"
          style={{ flexGrow: 0, maxHeight: 500 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
          data={[1]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={() => (
            <View className="pt-4 w-72">
              <View className="w-full mb-4">
                <Text className="text-sm font-bold mb-1">
                  Enter Agreed Price
                </Text>
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
                      label="MTN Momo"
                      value="MTN Momo"
                      style={{ fontSize: 15 }}
                    />
                    <Picker.Item
                      label="VodaCash"
                      value="VodaCash"
                      style={{ fontSize: 15 }}
                    />
                  </Picker>
                </View>
              </View>
              <View className="w-full mb-4">
                <Text className="text-sm font-bold mb-1">
                  Where are you located?
                </Text>
                <View style={{ position: "relative" }}>
                  <GooglePlacesAutocomplete
                    ref={googlePlacesAutocompleteRef}
                    placeholder="Location"
                    onPress={(data, details = null) => {
                      const selectedLocation =
                        data.structured_formatting.main_text;
                      setBookingData((prevData) => ({
                        ...prevData,
                        location: selectedLocation,
                      }));
                    }}
                    query={{
                      key: `${GOOGLE_MAPS_API_KEY}`,
                      language: "en",
                      components: "country:gh",
                      location: "6.6685,-1.5557",
                      radius: 5000,
                      strictbounds: true,
                    }}
                    renderDescription={(description) =>
                      description.structured_formatting.main_text
                    }
                    styles={{
                      textInputContainer: {
                        borderWidth: 1,
                        borderColor: "green",
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        paddingRight: 16,
                      },
                      textInput: {
                        fontSize: 16,
                        flex: 1,
                      },
                      poweredContainer: {
                        display: "none",
                      },
                    }}
                    textInputProps={{
                      onChangeText: (text) => {
                        if (text === "") {
                          setIsLocationEmpty(true);
                        } else {
                          setIsLocationEmpty(false);
                        }
                      },
                    }}
                  />
                  {!isLocationEmpty && (
                    <TouchableOpacity
                      onPress={() => {
                        googlePlacesAutocompleteRef.current?.setAddressText("");
                        // setIsLocationEmpty(true);
                        setBookingData((prevData) => ({
                          ...prevData,
                          location: "",
                        }));
                      }}
                      style={{ position: "absolute", top: 16, right: 10 }}
                    >
                      <Ionicons name="close" size={16} color="gray" />
                    </TouchableOpacity>
                  )}

                  {isLocationUnavailable && (
                    <Text className="text-red-600 text-sm mx-2">
                      Location Unavailable
                    </Text>
                  )}
                </View>
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
          )}
        />

        <View
          className={`flex ${
            !keyboardVisible && "flex-1"
          } items-center justify-between`}
        >
          {!keyboardVisible && (
            <TouchableOpacity
              className="mt-10 w-72 flex-row self-start items-center border border-yellow-500 rounded-2xl px-4 py-2"
              onPress={handleCautionClick}
            >
              <Ionicons
                name="alert-circle-outline"
                size={24}
                color="orange"
                style={{ marginRight: 8 }}
              />
              <Text className="text-black font-bold">
                Read some tips for when booking services
              </Text>
            </TouchableOpacity>
          )}

          <View className="w-52  mt-2 justify-end">
            {isBooking ? (
              <View className="flex justify-center items-center h-10">
                <DotIndicator color="green" count={3} size={10} />
              </View>
            ) : (
              <TouchableOpacity
                className={`${
                  isBookingDisabled ? "bg-gray-500" : "bg-green-500"
                } text-white py-2 px-4 w-52 rounded-lg justify-end`}
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
      </View>

      <Modal
        visible={isConfirmationModalVisible}
        animationType="slide"
        backdropOpacity={0.7}
        backdropColor="black"
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          margin: 0,
        }}
      >
        <View
          className="flex-1 w-full p-4 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          {isConfirming ? (
            <ActivityIndicator color="green" size="large" />
          ) : (
            <View className="bg-white p-6 rounded-2xl">
              <Text className="text-xl text-center font-bold mb-4">
                Confirm Service Booking
              </Text>
              <Text className="mb-6 text-lg text-center">
                {`Are you sure you want to book ${provider.business_name}?`}
              </Text>
              <View className="flex-row-reverse justify-evenly">
                <TouchableOpacity onPress={handleConfirm}>
                  <Text className="text-green-500 text-xl font-bold">Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancel}>
                  <Text className="text-red-500 font-bold text-xl">No</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      <Modal
        isVisible={isSuccessModalVisible}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropOpacity={0.4}
      >
        <Animatable.View
          ref={animationRef}
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          {isSuccess ? (
            <Animatable.Image
              source={require("../../../assets/success.jpg")}
              style={{ height: 100, width: 100 }}
              animation="fadeIn"
            />
          ) : (
            <Animatable.View animation="shake">
              <Ionicons name="close" size={100} color="red" />
            </Animatable.View>
          )}
          <Text style={{ marginTop: 20, fontSize: 18 }}>
            {isSuccess
              ? "Service booked successfully"
              : "Service booking failed"}
          </Text>
        </Animatable.View>
      </Modal>

      {isModalVisible && (
        <BookingTipsModal
          isVisible={isModalVisible}
          onClose={handleModalClose}
        />
      )}
    </SafeAreaView>
  );
};

export default BookServiceScreen;
