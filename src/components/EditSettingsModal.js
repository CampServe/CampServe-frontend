import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal as Modals,
} from "react-native";
import React, { useState, useEffect } from "react";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { TextInput } from "react-native";
import { ScrollView } from "react-native";
import { Image } from "react-native";
import {
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { storage } from "../utils/firebase";
import * as ImagePicker from "expo-image-picker";
import { uriToBlob } from "../lib/uriToBlob";
import defaultImage from "../../assets/camera.jpg";
import { DotIndicator } from "react-native-indicators";
import { updateDetails } from "../hooks/SPuseApi";
import * as Animatable from "react-native-animatable";
import Success from "../../assets/success.jpg";
import Failure from "../../assets/failure.jpg";
import { useNavigation } from "@react-navigation/native";

const EditSettingsModal = ({ visible, onClose, providerDetails }) => {
  const navigation = useNavigation();
  const initialFormData = {
    business_name: "",
    bio: "",
    provider_contact: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [activeSubcategory, setActiveSubcategory] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [modalMessage, setModalMessage] = useState({});
  const [details, setDetails] = useState([]);

  const isFormDataEmpty = () => {
    const { subcategories, ...restFormData } = formData;

    const formDataEmpty = Object.values(restFormData).every(
      (value) => value.trim() === ""
    );

    let subcategoriesEmpty = true;
    if (subcategories) {
      subcategoriesEmpty = subcategories.reduce((isEmpty, subcategory) => {
        return (
          isEmpty &&
          subcategory.description.trim() === "" &&
          subcategory.image.trim() === ""
        );
      }, true);
    }

    return formDataEmpty && subcategoriesEmpty;
  };

  useEffect(() => {
    if (!visible) {
      setFormData(initialFormData);
    }
  }, [visible]);

  useEffect(() => {
    if (providerDetails) {
      setFormData((prev) => {
        const subcategories = providerDetails.subcategories.map(
          (subcategory) => ({
            name: subcategory.subcategory,
            description: "",
            image: "",
          })
        );
        return { ...prev, subcategories };
      });
    }
  }, [providerDetails]);

  useEffect(() => {
    if (providerDetails.subcategories.length > 0) {
      filterBySubcategory(providerDetails?.subcategories[0]?.subcategory);
    }
  }, [providerDetails]);

  const filterBySubcategory = (subcategory) => {
    setActiveSubcategory(subcategory);
    const filteredSubcategoryData = providerDetails?.subcategories.filter(
      (item) => item?.subcategory === subcategory
    );
    setFilteredData(filteredSubcategoryData);
  };

  const handleDescriptionChange = (subcategory, description) => {
    setFormData((prevFormData) => {
      const updatedSubcategories = prevFormData.subcategories.map((item) =>
        item.name === subcategory ? { ...item, description: description } : item
      );
      return { ...prevFormData, subcategories: updatedSubcategories };
    });
  };

  const pickImage = async (subcategory, url) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission denied");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setUploading(true);
      const { uri } = result.assets[0];
      const filename = uri.split("/").pop();
      const blob = await uriToBlob(uri);

      const imageName = filename;
      const imageRef = ref(storage, imageName);

      try {
        if (url && url.includes("firebasestorage")) {
          const existingImageRef = ref(storage, url);
          await deleteObject(existingImageRef);
        }

        const uploadTask = uploadBytes(imageRef, blob);
        await uploadTask;

        const downloadURL = await getDownloadURL(imageRef);

        setFormData((prevFormData) => {
          const updatedSubcategories = prevFormData.subcategories.map((item) =>
            item.name === subcategory ? { ...item, image: downloadURL } : item
          );
          return { ...prevFormData, subcategories: updatedSubcategories };
        });
      } catch (error) {
        console.log("Upload failed:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  const validate = (data) => {
    const newErrors = {};

    if (data.business_name && data.business_name.length < 5) {
      newErrors.business_name = "Business name must be at least 5 characters";
    }

    if (data.bio && data.bio.length < 10) {
      newErrors.bio = "Bio must be at least 10 characters";
    }

    if (data.provider_contact && !/^[0][0-9]{9}$/.test(data.provider_contact)) {
      newErrors.provider_contact = "Contact must be a number starting from 0";
    }

    if (data.subcategories) {
      data.subcategories.forEach((subcategory) => {
        if (subcategory.description && subcategory.description.length < 10) {
          newErrors[subcategory.name] =
            "Description must be at least 10 characters";
        }
      });
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const trimmedFormData = {
      user_id: providerDetails.user_id,
      provider_id: providerDetails.provider_id,
      bio: formData.bio.trim(),
      business_name: formData.business_name.trim(),
      provider_contact: formData.provider_contact.trim(),
      subcategories: formData.subcategories.map((subcategory) => ({
        ...subcategory,
        description: subcategory.description.trim(),
      })),
    };

    const newData = {
      provider_id: trimmedFormData.provider_id,
      user_id: trimmedFormData.user_id,
      ...Object.fromEntries(
        Object.entries(trimmedFormData).filter(([key, value]) => value !== "")
      ),
      subcategories: trimmedFormData?.subcategories
        .map((subcategory) => {
          if (subcategory.name === "") {
            return null;
          } else if (
            subcategory?.description !== "" &&
            subcategory?.image === ""
          ) {
            const { image, ...rest } = subcategory;
            return rest;
          } else if (
            subcategory?.image !== "" &&
            subcategory?.description === ""
          ) {
            const { description, ...rest } = subcategory;
            return rest;
          } else if (
            subcategory?.description === "" &&
            subcategory?.image === ""
          ) {
            return null;
          }
          return subcategory;
        })
        .filter(Boolean),
    };

    if (newData.subcategories.length === 0) {
      delete newData.subcategories;
    }

    const newErrors = validate(newData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setDetails(newData);
      setIsConfirmationModalVisible(true);
    }

    setTimeout(() => {
      setErrors({});
    }, 5000);
  };

  const handleCancel = () => {
    setIsConfirmationModalVisible(false);
  };

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      const success = await updateDetails(details);
      setIsConfirming(false);
      setIsConfirmationModalVisible(false);
      if (success) {
        setIsModalVisible(true);
        setModalMessage({
          message: "Service has been updated",
          image: Success,
        });
      } else {
        setIsModalVisible(true);
        setModalMessage({ message: "Service update failed", image: Failure });
      }
      setTimeout(() => {
        setIsModalVisible(false);
        onClose();
        navigation.replace("Service Provider");
      }, 5000);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Modal
        isVisible={visible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        style={{ margin: 0 }}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white h-[95%] rounded-t-3xl">
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text className="text-2xl flex-1 text-center font-bold my-5">
                Update Details
              </Text>
              <TouchableOpacity onPress={onClose} style={{ padding: 16 }}>
                <Ionicons name="close-sharp" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <ScrollView className="px-4 mb-4">
              <View className="w-full mb-4">
                <Text className="text-sm font-bold mb-1">Business Name</Text>
                <TextInput
                  className={`border focus:border-2 border-green-500 focus:border-green-700 rounded-lg px-4 py-2 focus:outline-none`}
                  placeholder={providerDetails.business_name}
                  value={formData.business_name}
                  onChangeText={(value) =>
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      business_name: value,
                    }))
                  }
                />
                {errors.business_name && (
                  <Text className="text-red-500 text-xs">
                    {errors.business_name}
                  </Text>
                )}
              </View>

              <View className="w-full mb-4">
                <Text className="text-sm font-bold mb-1">Bio</Text>
                <TextInput
                  className={`border focus:border-2 border-green-500 focus:border-green-700 rounded-lg px-4 py-2 focus:outline-none`}
                  placeholder={providerDetails.bio}
                  multiline={true}
                  numberOfLines={6}
                  value={formData.bio}
                  onChangeText={(value) =>
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      bio: value,
                    }))
                  }
                  textAlignVertical="top"
                />
                {errors.bio && (
                  <Text className="text-red-500 text-xs">{errors.bio}</Text>
                )}
              </View>

              <View className="w-full mb-4">
                <Text className="text-sm font-bold mb-1">Contact Number</Text>
                <TextInput
                  className={`border focus:border-2 border-green-500 focus:border-green-700 rounded-lg px-4 py-2 focus:outline-none`}
                  placeholder={providerDetails.contact}
                  keyboardType="number-pad"
                  maxLength={10}
                  value={formData.provider_contact}
                  onChangeText={(value) =>
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      provider_contact: value,
                    }))
                  }
                />
                {errors.provider_contact && (
                  <Text className="text-red-500 text-xs">
                    {errors.provider_contact}
                  </Text>
                )}
              </View>

              <View className="flex-row justify-around items-center">
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "center",
                  }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="gap-2 my-2"
                >
                  {Object.values(providerDetails.subcategories).map(
                    (subcategory, index) => (
                      <TouchableOpacity
                        key={index}
                        className={`px-4 py-2 rounded-xl ${
                          activeSubcategory === subcategory.subcategory
                            ? "bg-[#22543D]"
                            : "bg-gray-300"
                        }`}
                        onPress={() =>
                          filterBySubcategory(subcategory.subcategory)
                        }
                      >
                        <Text
                          className={`text-base font-bold ${
                            activeSubcategory === subcategory.subcategory
                              ? "text-white"
                              : "text-black"
                          }`}
                        >
                          {subcategory.subcategory}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>
              </View>

              {filteredData.length > 0 &&
                activeSubcategory === filteredData[0].subcategory && (
                  <View className="flex-row items-center">
                    <View className="pt-3 w-[70%]">
                      <Text className="text-sm font-bold mb-1">
                        Description
                      </Text>
                      <TextInput
                        className={`border focus:border-2 border-green-500 focus:border-green-700 rounded-lg px-4 py-2 focus:outline-none`}
                        multiline={true}
                        numberOfLines={4}
                        textAlignVertical="top"
                        value={
                          formData.subcategories.find(
                            (item) => item.name === activeSubcategory
                          )?.description ?? ""
                        }
                        onChangeText={(value) =>
                          handleDescriptionChange(
                            filteredData[0].subcategory,
                            value
                          )
                        }
                        placeholder={filteredData[0].description}
                      />
                      {errors[activeSubcategory] && (
                        <Text className="text-red-500 text-xs">
                          {errors[activeSubcategory]}
                        </Text>
                      )}
                    </View>
                    <View className="flex-col flex-1 w-[30%] items-center pt-7">
                      <TouchableOpacity
                        onPress={() =>
                          pickImage(
                            filteredData[0].subcategory,
                            filteredData[0].subcategory_image.uri
                          )
                        }
                      >
                        <Image
                          source={
                            formData.subcategories.find(
                              (item) => item.name === activeSubcategory
                            )?.image
                              ? {
                                  uri: formData.subcategories.find(
                                    (item) => item.name === activeSubcategory
                                  ).image,
                                }
                              : defaultImage
                          }
                          resizeMode="cover"
                          className="rounded-md w-[90px] h-[80px]"
                        />
                      </TouchableOpacity>
                      {uploading && (
                        <DotIndicator color="green" size={8} count={3} />
                      )}
                    </View>
                  </View>
                )}
            </ScrollView>
            <View className="flex items-center justify-center">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={uploading || isFormDataEmpty()}
                className={`bg-${
                  isFormDataEmpty() || uploading ? "gray" : "green"
                }-500 w-52 text-white py-2 px-4 my-3 rounded-lg`}
              >
                <Text className="text-center text-lg">Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modals
        visible={isConfirmationModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View
          className="flex-1 w-full h-full p-4 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          {isConfirming ? (
            <ActivityIndicator color="green" size="large" />
          ) : (
            <View className="bg-white p-6 rounded-2xl">
              <Text className="text-xl text-center font-bold mb-4">
                Confirm Service Update
              </Text>
              <Text className="mb-6 text-center text-lg">
                Are you sure you want to update service details?
              </Text>
              <View className="flex-row-reverse justify-evenly">
                <TouchableOpacity onPress={handleConfirm}>
                  <Text className="text-green-500 text-xl font-bold">
                    Confirm
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancel}>
                  <Text className="text-red-500 font-bold text-xl">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modals>

      <Modals visible={isModalVisible} animationType="slide" transparent={true}>
        <View
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <View className="bg-white flex items-center justify-center p-6 rounded-2xl">
            <Animatable.Image
              source={modalMessage?.image}
              style={{ height: 100, width: 100 }}
              animation="fadeIn"
              iterationCount="infinite"
              className="mb-4"
            />
            <Text className="text-xl my-2 text-center font-bold mb-2">
              {modalMessage?.message}
            </Text>
          </View>
        </View>
      </Modals>
    </>
  );
};

export default EditSettingsModal;
