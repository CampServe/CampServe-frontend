import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import Modal from "react-native-modal";
import * as ImagePicker from "expo-image-picker";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { storage } from "../utils/firebase";
import { DotIndicator } from "react-native-indicators";
import { uriToBlob } from "../lib/uriToBlob";

const DescriptionModal = ({ visible, onClose, subcategories, onSave }) => {
  const [descriptions, setDescriptions] = useState([]);
  const [images, setImages] = useState([]);
  const [imageInfo, setImageInfo] = useState([]);
  const [uploading, setUploading] = useState(false);

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
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setUploading(true);
      const { uri } = result.assets[0];
      const filename = uri.split("/").pop();
      const extension = filename.split(".").pop();

      const blob = await uriToBlob(uri);

      const imageName = filename;
      const imageRef = ref(storage, imageName);
      const uploadTask = uploadBytes(imageRef, blob);

      try {
        await uploadTask;
        const downloadURL = await getDownloadURL(imageRef);

        const imageInfoEntry = {
          category,
          subcategoryIndex,
          filename,
          extension,
          localUri: uri,
        };

        setImageInfo((prevImageInfo) => [...prevImageInfo, imageInfoEntry]);

        setImages((prevImages) => [
          ...prevImages,
          { category, subcategoryIndex, downloadURL },
        ]);
      } catch (error) {
        console.log("Upload failed:", error);
      } finally {
        setUploading(false);
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
        <View className="bg-white h-[95%] rounded-t-3xl">
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
            keyboardShouldPersistTaps="handled"
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
                    <Text className="text-base pt-4 font-semibold">
                      {subcategory}
                    </Text>
                    <View className="flex-row items-center">
                      <View className="pt-3 w-[70%]">
                        <TextInput
                          multiline={true}
                          numberOfLines={4}
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
                      <View className="flex-col flex-1 w-[30%] items-center pt-4">
                        <TouchableOpacity
                          onPress={() =>
                            pickImage(subcategoryGroup.category, index)
                          }
                        >
                          <Image
                            source={
                              imageInfo.find(
                                (info) =>
                                  info.category === subcategoryGroup.category &&
                                  info.subcategoryIndex === index
                              )
                                ? {
                                    uri: imageInfo.find(
                                      (info) =>
                                        info.category ===
                                          subcategoryGroup.category &&
                                        info.subcategoryIndex === index
                                    ).localUri,
                                  }
                                : require("../../assets/camera.jpg")
                            }
                            resizeMode="cover"
                            className="rounded-md w-[90px] h-[70px]"
                          />
                        </TouchableOpacity>
                        {imageInfo.find(
                          (info) =>
                            info.category === subcategoryGroup.category &&
                            info.subcategoryIndex === index
                        ) ? (
                          <Text className="text-xs pt-1">
                            {uploading ? (
                              <DotIndicator color="green" size={8} count={3} />
                            ) : (
                              <>
                                {imageInfo.find(
                                  (info) =>
                                    info.category ===
                                      subcategoryGroup.category &&
                                    info.subcategoryIndex === index
                                ).filename.length > 20
                                  ? imageInfo
                                      .find(
                                        (info) =>
                                          info.category ===
                                            subcategoryGroup.category &&
                                          info.subcategoryIndex === index
                                      )
                                      .filename.slice(0, 8) + "..."
                                  : imageInfo.find(
                                      (info) =>
                                        info.category ===
                                          subcategoryGroup.category &&
                                        info.subcategoryIndex === index
                                    ).filename}
                                .
                                {
                                  imageInfo.find(
                                    (info) =>
                                      info.category ===
                                        subcategoryGroup.category &&
                                      info.subcategoryIndex === index
                                  ).extension
                                }
                              </>
                            )}
                          </Text>
                        ) : (
                          <>
                            <Text className="text-xs pt-1">(optional)</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            ))}
          </ScrollView>

          <View className="flex items-center justify-center">
            <TouchableOpacity
              onPress={handleSave}
              disabled={hasErrors() || uploading}
              className={`bg-${
                hasErrors() ? "gray" : "green"
              }-500 w-52 text-white py-2 px-4 my-3 rounded-lg`}
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
