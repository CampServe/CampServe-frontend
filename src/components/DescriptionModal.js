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

const DescriptionModal = ({ visible, onClose, subcategories, onSave }) => {
  const [descriptions, setDescriptions] = useState([]);

  useEffect(() => {
    if (visible) {
      setDescriptions({});
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
            .subcategory.map((name, index) => ({
              name,
              description: descriptions[category][index],
            })),
        })
      );
      //   console.log(JSON.stringify(updatedSubcategories, null, 2));
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

  return (
    <Modal
      isVisible={visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.2}
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
                  <View key={index} className="pt-4">
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
                    {descriptions[subcategoryGroup.category]?.[index]?.length <
                      10 && (
                      <Text className="text-red-500 text-xs">
                        Description should be at least 10 characters
                      </Text>
                    )}
                  </View>
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
