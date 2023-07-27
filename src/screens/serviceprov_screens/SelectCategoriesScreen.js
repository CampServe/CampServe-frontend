import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from "react-native";
import Backbutton from "../../components/Backbutton";
import useAuth from "../../hooks/useAuth";
import DescriptionModal from "../../components/DescriptionModal";
import { addService } from "../../hooks/SPuseApi";

const Categories = [
  {
    id: 1,
    name: "Room",
    subcategories: ["Laundry", "Room Decoration"],
  },
  {
    id: 2,
    name: "Tutoring",
    subcategories: ["Academic Tutoring", "Exams Preparation"],
  },
  {
    id: 3,
    name: "Design",
    subcategories: ["UI/UX Design", "Graphic Design"],
  },
];

const SelectCategoriesScreen = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedDescriptions, setSelectedDescriptions] = useState([]);
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] =
    useState(false);

  const { params } = useRoute();
  const navigation = useNavigation();
  const { user, signupAsProvider } = useAuth();

  const categories = params?.categoriesArray || Categories;

  const handleCategorySelection = (categoryId) => {
    setSelectedCategories((prevSelectedCategories) => {
      if (prevSelectedCategories.includes(categoryId)) {
        const updatedSelectedCategories = prevSelectedCategories.filter(
          (id) => id !== categoryId
        );

        setSelectedSubcategories((prevSelectedSubcategories) => {
          const updatedSelectedSubcategories = prevSelectedSubcategories.filter(
            (item) =>
              item.category !==
              categories.find((category) => category.id === categoryId).name
          );
          return updatedSelectedSubcategories;
        });

        return updatedSelectedCategories;
      } else {
        const selectedCategory = categories.find(
          (category) => category.id === categoryId
        );
        const selectedCategoryObject = {
          category: selectedCategory.name,
          subcategory: [],
        };
        return [...prevSelectedCategories, categoryId];
        setSelectedSubcategories((prevSelectedSubcategories) => {
          return [...prevSelectedSubcategories, selectedCategoryObject];
        });
      }
    });
  };

  const handleSubcategorySelection = (subcategory, category) => {
    setSelectedSubcategories((prevSelectedSubcategories) => {
      const existingIndex = prevSelectedSubcategories.findIndex(
        (item) => item.category === category
      );

      if (existingIndex !== -1) {
        const updatedSelectedSubcategories = [...prevSelectedSubcategories];
        const existingCategory = updatedSelectedSubcategories[existingIndex];

        if (existingCategory.subcategory.has(subcategory)) {
          existingCategory.subcategory.delete(subcategory);
        } else {
          existingCategory.subcategory.add(subcategory);
        }

        return updatedSelectedSubcategories;
      } else {
        return [
          ...prevSelectedSubcategories,
          { category, subcategory: new Set([subcategory]) },
        ];
      }
    });
  };

  const convertSubcategoriesToArray = (subcategories) => {
    const convertedSubcategories = [];

    subcategories.forEach((subcategory) => {
      if (subcategory.subcategory instanceof Set) {
        const subcategoryArray = Array.from(subcategory.subcategory);
        convertedSubcategories.push({
          category: subcategory.category,
          subcategory: subcategoryArray,
        });
      } else {
        convertedSubcategories.push(subcategory);
      }
    });

    return convertedSubcategories;
  };

  const conselectedSubcategories = convertSubcategoriesToArray(
    selectedSubcategories
  );

  const handleDonePress = () => {
    setIsDescriptionModalVisible(true);
  };

  const handleSaveDescriptions = (updatedSelectedDescriptions) => {
    setSelectedDescriptions(updatedSelectedDescriptions);
    setIsConfirmationModalVisible(true);
  };

  const trimObjectValues = (obj) => {
    const trimmedObj = {};
    for (let key in obj) {
      if (typeof obj[key] === "string") {
        trimmedObj[key] = obj[key].trim();
      } else {
        trimmedObj[key] = obj[key];
      }
    }
    return trimmedObj;
  };

  const handleConfirm = async () => {
    if (params?.formData) {
      const providerData = {
        ...trimObjectValues(params.formData),
        selectedSubcategories: selectedDescriptions,
      };
      try {
        setIsConfirming(true);
        const success = await signupAsProvider(user.user_id, providerData);
        setIsConfirming(false);

        setIsConfirmationModalVisible(false);
        setIsSuccess(success);
        setModalMessage(success ? "SignUp successful" : "SignUp failed");
        setIsModalVisible(true);
      } catch (error) {
        console.log(error);
        setIsConfirming(false);
        setIsSuccess(false);
        setIsModalVisible(true);
        setModalMessage("An error occurred while signing up as a provider");
      } finally {
        setSelectedCategories([]);
        setSelectedDescriptions([]);
        setIsConfirmationModalVisible(false);
      }
    } else {
      try {
        setIsConfirming(true);
        const success = await addService(user.user_id, selectedDescriptions);
        setIsConfirming(false);

        setIsConfirmationModalVisible(false);
        setIsSuccess(success);
        setModalMessage(success ? "Service Added" : "Service Addition Failed");
        setIsModalVisible(true);
      } catch (error) {
        console.log(error);
        setIsConfirming(false);
        setIsSuccess(false);
        setIsModalVisible(true);
        setModalMessage("An error occurred while adding a new service");
      } finally {
        setSelectedCategories([]);
        setSelectedDescriptions([]);
        setSelectedSubcategories([]);
        setIsConfirmationModalVisible(false);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    if (isSuccess) {
      navigation.replace(params?.formData ? "User" : "Service Provider");
    }
  };

  const handleCancel = () => {
    setIsConfirmationModalVisible(false);
  };

  const isDoneDisabled = () => {
    return (
      conselectedSubcategories.length === 0 ||
      conselectedSubcategories.every(
        (subcategory) => subcategory.subcategory.length === 0
      )
    );
  };

  return (
    <>
      <SafeAreaView className="flex flex-1 p-6 justify-center items-center bg-white">
        <Backbutton />
        <Text className="text-2xl text-center font-bold my-5">
          Service Category
        </Text>
        <Text className="text-xl text-center font-semibold">
          Select Categories
        </Text>
        <View className="flex-row">
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleCategorySelection(category.id)}
              className={`rounded-full p-4 m-4 items-center justify-center w-24 h-24 ${
                selectedCategories.includes(category.id)
                  ? "bg-green-900"
                  : "bg-green-900 opacity-60"
              }`}
            >
              <Text className="text-white text-center">{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {selectedCategories.length > 0 && (
            <View className="flex flex-1 mt-8">
              <Text className="text-xl text-center font-bold mb-6">
                Select Subcategories
              </Text>
              <View className="flex flex-wrap">
                {selectedCategories.map((categoryId, index) => {
                  const selectedCategory = categories.find(
                    (category) => category.id === categoryId
                  );
                  return (
                    <React.Fragment key={index}>
                      <View className="flex">
                        <Text className="text-base font-semibold">
                          {selectedCategory.name}
                        </Text>
                      </View>
                      <View className="flex-row flex-wrap justify-center">
                        {selectedCategory.subcategories.map(
                          (subcategory, index) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() =>
                                handleSubcategorySelection(
                                  subcategory,
                                  selectedCategory.name
                                )
                              }
                              className={`rounded-full p-4 m-4 items-center justify-center w-24 h-24 ${
                                selectedSubcategories.some(
                                  (item) =>
                                    item.category === selectedCategory.name &&
                                    item.subcategory.has(subcategory)
                                )
                                  ? "bg-green-900"
                                  : "bg-green-900 opacity-60"
                              }`}
                            >
                              <Text className="text-white text-center">
                                {subcategory}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </View>
                    </React.Fragment>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        <View>
          <TouchableOpacity
            onPress={handleDonePress}
            disabled={isDoneDisabled()}
            className={`bg-${
              isDoneDisabled() ? "gray" : "green"
            }-500 w-52 text-white py-2 px-4 rounded-lg mt-8`}
          >
            <Text className="text-center text-lg">Next</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Modal
        visible={isConfirmationModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View
          className="flex-1 p-4 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          {isConfirming ? (
            <ActivityIndicator color="green" size="large" />
          ) : (
            <View className="bg-white p-6 rounded-2xl">
              <Text className="text-xl text-center font-bold mb-4">
                Confirm{" "}
                {params?.formData ? "Account Creation" : "Service Addition"}
              </Text>
              <Text className="mb-6 text-center text-lg">
                Are you sure you want to{" "}
                {params?.formData
                  ? "create your service provider account?"
                  : "add new service?"}
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
      </Modal>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <View className="bg-white p-6 rounded-2xl">
            <Text className="text-xl text-center font-bold mb-4">
              {modalMessage}
            </Text>
            <TouchableOpacity
              onPress={handleModalClose}
              className="bg-green-500 py-2 px-4 rounded-lg"
            >
              <Text className="text-white text-center text-lg">
                {isSuccess ? "Back to Dashboard" : "Close"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DescriptionModal
        visible={isDescriptionModalVisible}
        onClose={() => setIsDescriptionModalVisible(false)}
        subcategories={conselectedSubcategories}
        onSave={handleSaveDescriptions}
      />
    </>
  );
};

export default SelectCategoriesScreen;
