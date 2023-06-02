import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import { useNavigation } from "@react-navigation/native";

const SearchScreen = () => {
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState("Service Providers");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    "Service Provider 1",
    "Service Provider 2",
    "Type A",
    "Type B",
  ]);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    updateSearchResults(searchInput, filter, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    updateSearchResults(searchInput, selectedFilter, category);
  };

  const handleSearchInputChange = (text) => {
    setSearchInput(text);
    updateSearchResults(text, selectedFilter, selectedCategory);
  };

  const handleClearSearchInput = () => {
    setSearchInput("");
    updateSearchResults("", selectedFilter, selectedCategory);
  };

  const updateSearchResults = (text, filter, category) => {
    if (text === "") {
      setSearchResults([]);
      return;
    }

    const filteredResults = dummyData.filter((result) => {
      const nameMatch =
        result.name.toLowerCase().includes(text.toLowerCase()) &&
        filter === "Service Providers";
      const typeMatch =
        result.type.toLowerCase().includes(text.toLowerCase()) &&
        filter === "Type of Services";
      const categoryMatch =
        result.category.toLowerCase().includes(category.toLowerCase()) &&
        category !== "";
      return (nameMatch || typeMatch) && categoryMatch;
    });

    setSearchResults(filteredResults);
  };

  const filters = ["Service Providers", "Type of Services"];
  const categories = ["Category A", "Category B", "Category C"];

  const dummyData = [
    { name: "Service Provider 1", type: "Type A", category: "Category A" },
    { name: "Service Provider 2", type: "Type B", category: "Category B" },
    { name: "Service Provider 3", type: "Type A", category: "Category C" },
    { name: "Service Provider 4", type: "Type C", category: "Category A" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <View className="flex flex-row h-10 w-full my-4 items-center px-2 rounded-full bg-gray-200">
        <Feather name="search" size={20} className="mr-2 text-gray-500" />
        <TextInput
          className="flex-1 p-0 pl-2 text-gray-800 placeholder-gray-500"
          placeholder="Search services"
          value={searchInput}
          onChangeText={handleSearchInputChange}
        />
        {searchInput !== "" && (
          <TouchableOpacity onPress={handleClearSearchInput}>
            <Feather name="x" size={20} className="ml-2 text-gray-500" />
          </TouchableOpacity>
        )}
      </View>
      <View className="mb-6">
        <Text className="text-lg font-semibold">Filter:</Text>
        <View className="flex flex-row mt-2">
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => handleFilterChange(filter)}
              className={`mr-4 py-2 px-4 rounded-full ${
                selectedFilter === filter
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              <Text>{filter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {selectedFilter === "Type of Services" && (
        <View className="mb-6">
          <Text className="text-lg font-semibold">Category:</Text>
          <View className="flex flex-row mt-2">
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => handleCategoryChange(category)}
                className={`mr-4 py-2 px-4 rounded-full ${
                  selectedCategory === category
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                <Text>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      {searchResults.length > 0 ? (
        <View>
          {searchResults.map((result, index) => (
            <View key={index} className="border-b border-gray-300 py-4">
              <Text className="text-lg font-semibold">{result.name}</Text>
              <Text className="text-gray-500">{result.type}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View>
          {searchInput === "" && (
            <View>
              <Text className="text-lg font-semibold mb-2">
                Recent Searches:
              </Text>
              {recentSearches
                .filter((search) =>
                  selectedFilter === "Service Providers"
                    ? search.startsWith("Service Provider")
                    : search.startsWith("Type")
                )
                .map((search, index) => (
                  <View key={index} className="border-b border-gray-300 py-4">
                    <Text>{search}</Text>
                  </View>
                ))}
            </View>
          )}
          {searchInput !== "" && (
            <View className=" items-center justify-center">
              <Text>No results found.</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;
