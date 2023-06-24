import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import Modal from "react-native-modal";
import * as ImagePicker from "expo-image-picker";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { storage } from "../utils/firebase";

const DescriptionModal = ({ visible, onClose, subcategories, onSave }) => {
  const [descriptions, setDescriptions] = useState([]);
  const [images, setImages] = useState([]);
  const [imageInfo, setImageInfo] = useState([]);

  useEffect(() => {
    if (visible) {
      setDescriptions([]);
      setImageInfo([]);
      setImages([]);
    }
  }, [visible]);

  const hasErrors = () => {
    const hasInputErrors = Object.keys(descriptions).some((category) =>
      descriptions[category].some((description) => description.length < 10)
    );

    const hasEmptyInputs = Object.keys(descriptions).every((category) =>
      descriptions[category].every((description) => description === "")
    );

    return hasInputErrors || hasEmptyInputs;
  };

  const handleSave = () => {
    if (!hasErrors()) {
      const updatedSubcategories = Object.keys(descriptions).map(
        (category) => ({
          category: category,
          subcategories: subcategories
            .find((subcat) => subcat.category === category)
            .subcategory.map((name, index) => {
              const image = images.find(
                (img) =>
                  img.category === category && img.subcategoryIndex === index
              );
              return {
                name,
                description: descriptions[category][index],
                image: image ? image.downloadURL : "",
              };
            }),
        })
      );

      // console.log(JSON.stringify(updatedSubcategories, null, 2));
      onSave(updatedSubcategories);
      onClose();
    }
  };

  const handleInputChange = (category, subcategoryIndex, text) => {
    setDescriptions((prevDescriptions) => {
      const updatedDescriptions = {
        ...prevDescriptions,
        [category]: [...(prevDescriptions[category] || [])],
      };
      updatedDescriptions[category][subcategoryIndex] = text;
      return updatedDescriptions;
    });
  };

  const handleBlur = (category, subcategoryIndex) => {
    setDescriptions((prevDescriptions) => {
      const updatedDescriptions = { ...prevDescriptions };
      const description =
        updatedDescriptions[category]?.[subcategoryIndex] || "";
      if (description.length < 10) {
        updatedDescriptions[category][subcategoryIndex] = "";
      }
      return updatedDescriptions;
    });
  };

  const pickImage = async (category, subcategoryIndex) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission denied");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const { uri } = result.assets[0];
      const filename = uri.split("/").pop();
      const extension = filename.split(".").pop();

      const response = await fetch(uri);
      const blob = await response.blob();

      const imageName = `image_${Date.now()}`;
      const imageRef = ref(storage, imageName);
      const uploadTask = uploadBytes(imageRef, blob);

      try {
        await uploadTask;
        const downloadURL = await getDownloadURL(imageRef);

        setImages((prevImages) => [
          ...prevImages,
          { category, subcategoryIndex, downloadURL },
        ]);

        const updatedImageInfo = [...imageInfo];
        updatedImageInfo.push({
          category,
          subcategoryIndex,
          filename,
          extension,
        });
        setImageInfo(updatedImageInfo);
      } catch (error) {
        console.log("Upload failed:", error);
      }
    }
  };

  return (
    <Modal
      isVisible={visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      style={{ margin: 0 }}
    >
      <View className="flex-1 justify-end">
        <View className="bg-white h-[95%] rounded-t-3xl px-4">
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text className="text-2xl flex-1 text-center font-bold my-5">
              Service Description
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 16 }}>
              <Ionicons name="close-sharp" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {subcategories.map((subcategoryGroup) => (
              <View key={subcategoryGroup.category} className="pt-10 px-4">
                {subcategoryGroup.subcategory.length > 0 && (
                  <Text className="text-xl text-center font-bold">
                    {subcategoryGroup.category}
                  </Text>
                )}
                {subcategoryGroup.subcategory.map((subcategory, index) => (
                  <React.Fragment>
                    <View className="pt-4">
                      <Text className="text-base font-semibold mb-1">
                        {subcategory}
                      </Text>
                      <TextInput
                        multiline={true}
                        numberOfLines={3}
                        textAlignVertical="top"
                        placeholder="Enter description"
                        onChangeText={(text) =>
                          handleInputChange(
                            subcategoryGroup.category,
                            index,
                            text
                          )
                        }
                        onBlur={() =>
                          handleBlur(subcategoryGroup.category, index)
                        }
                        className={`border focus:border-2 ${
                          descriptions[subcategoryGroup.category]?.[index]
                            ?.length < 10
                            ? "border-red-500"
                            : "border-green-500"
                        } rounded-lg px-4 py-2 ${
                          descriptions[subcategoryGroup.category]?.[index]
                            ?.length < 10
                            ? "focus:border-red-700"
                            : "focus:border-green-700"
                        } focus:outline-none`}
                      />
                      {descriptions[subcategoryGroup.category]?.[index]
                        ?.length < 10 && (
                        <Text className="text-red-500 text-xs">
                          Description should be at least 10 characters
                        </Text>
                      )}
                    </View>
                    <View className="flex-row items-center gap-2 py-2 justify-center">
                      <TouchableOpacity
                        onPress={() =>
                          pickImage(subcategoryGroup.category, index)
                        }
                      >
                        <Ionicons
                          name="cloud-upload-outline"
                          size={20}
                          color="green"
                        />
                      </TouchableOpacity>
                      {imageInfo.find(
                        (info) =>
                          info.category === subcategoryGroup.category &&
                          info.subcategoryIndex === index
                      ) ? (
                        <Text className="text-sm">
                          {imageInfo.find(
                            (info) =>
                              info.category === subcategoryGroup.category &&
                              info.subcategoryIndex === index
                          ).filename.length > 20
                            ? imageInfo
                                .find(
                                  (info) =>
                                    info.category ===
                                      subcategoryGroup.category &&
                                    info.subcategoryIndex === index
                                )
                                .filename.slice(0, 17) + "..."
                            : imageInfo.find(
                                (info) =>
                                  info.category === subcategoryGroup.category &&
                                  info.subcategoryIndex === index
                              ).filename}
                          .
                          {
                            imageInfo.find(
                              (info) =>
                                info.category === subcategoryGroup.category &&
                                info.subcategoryIndex === index
                            ).extension
                          }
                        </Text>
                      ) : (
                        <Text className="text-sm">Upload Image (optional)</Text>
                      )}
                    </View>
                  </React.Fragment>
                ))}
              </View>
            ))}
          </ScrollView>

          <View className="flex items-center justify-center">
            <TouchableOpacity
              onPress={handleSave}
              disabled={hasErrors()}
              className={`bg-${
                hasErrors() ? "gray" : "green"
              }-500 w-52 text-white py-2 px-4 my-10 rounded-lg`}
            >
              <Text className="text-center text-lg">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DescriptionModal;
