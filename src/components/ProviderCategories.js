import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import CustomCard from "./CustomCard";
import { calculateAverageRating } from "./RatingsandReviews";

const ProviderCategories = ({
  mainCategories,
  selectedCategory,
  filterProvidersByCategory,
  uniqueSubCategories,
  selectedProviders,
  refreshColours,
  isRefreshing,
  onRefresh,
  getImageBySubCategory,
  handleCardPress,
}) => {
  return (
    <ScrollView>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="gap-2 mb-2"
      >
        {mainCategories.map((category) => (
          <TouchableOpacity
            key={category}
            style={{
              width: 120,
              transform: [{ scale: category === selectedCategory ? 1.05 : 1 }],
              transition: "transform 0.2s",
            }}
            onPress={() => filterProvidersByCategory(category)}
            className={`flex-1 items-center justify-center py-2 mb-3 rounded-lg ${
              category === selectedCategory
                ? "bg-green-900"
                : "bg-green-900 opacity-60"
            }`}
          >
            <Text className="text-white text-bold text-center text-lg">
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedProviders.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={refreshColours}
            />
          }
        >
          <View className="flex-1 items-center justify-center">
            <Text className="text-base font-semibold text-center">
              No service providers available.
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView>
          {uniqueSubCategories.map((subCategory) => (
            <View key={subCategory} className="pb-6">
              <Text className="font-bold text-[#0A4014] uppercase text-lg">
                {subCategory !== "Featured" && subCategory}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex flex-row flex-wrap"
              >
                {selectedProviders
                  .filter((provider) => provider.sub_categories === subCategory)
                  .map((filteredProvider) => (
                    <CustomCard
                      key={filteredProvider.user_id}
                      image={
                        filteredProvider.subcategory_image !== null
                          ? filteredProvider.subcategory_image
                          : getImageBySubCategory(
                              filteredProvider.sub_categories
                            )
                      }
                      businessName={filteredProvider.business_name}
                      bio={filteredProvider.bio}
                      contactNumber={filteredProvider.provider_contact}
                      ratings={calculateAverageRating(
                        filteredProvider.no_of_stars
                      )}
                      onPress={() => handleCardPress(filteredProvider)}
                    />
                  ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      )}
    </ScrollView>
  );
};

export default ProviderCategories;
