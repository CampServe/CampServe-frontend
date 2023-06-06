import { useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
} from "react-native";
import Backbutton from "../../components/Backbutton";

const categories = [
  {
    id: 1,
    name: "Room",
    subcategories: ["Laundry", "Gas Filling"],
  },
  {
    id: 2,
    name: "Tutoring",
    subcategories: ["Courses Tutoring", "Languages Tutoring"],
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

  const { params } = useRoute();

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

  console.log(conselectedSubcategories);

  const handleDonePress = () => {
    setIsConfirmationModalVisible(true);
  };

  const handleConfirm = () => {
    const payload = {
      formData: params.formData,
      selectedSubcategories: conselectedSubcategories,
    };

    // console.log(payload);

    setSelectedCategories([]);
    setSelectedCategories([]);
    setIsConfirmationModalVisible(false);
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
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategorySelection(category.id)}
              className={`rounded-full p-4 m-4 items-center justify-center w-24 h-24 ${
                selectedCategories.includes(category.id)
                  ? "bg-green-900"
                  : "bg-gray-600"
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
                {selectedCategories.map((categoryId) => {
                  const selectedCategory = categories.find(
                    (category) => category.id === categoryId
                  );
                  return (
                    <React.Fragment key={selectedCategory.id}>
                      <View className="flex">
                        <Text className="text-base font-semibold">
                          {selectedCategory.name}
                        </Text>
                      </View>
                      <View className="flex-row flex-wrap justify-center">
                        {selectedCategory.subcategories.map((subcategory) => (
                          <TouchableOpacity
                            key={subcategory}
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
                                : "bg-gray-600"
                            }`}
                          >
                            <Text className="text-white text-center">
                              {subcategory}
                            </Text>
                          </TouchableOpacity>
                        ))}
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
            <Text className="text-center text-lg">Done</Text>
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
          <View className="bg-white p-6 rounded-2xl">
            <Text className="text-xl text-center font-bold mb-4">
              Confirm Account Creation
            </Text>
            <Text className="mb-6 text-lg">
              Are you sure you want to create your service provider account?
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
        </View>
      </Modal>
    </>
  );
};

export default SelectCategoriesScreen;
