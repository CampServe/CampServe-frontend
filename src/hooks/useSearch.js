import React, { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQueries, setSearchQueries] = useState({});
  const [editModalVisible, setEditModalVisible] = useState(false);

  const updateSearchQuery = (screen, query) => {
    setSearchQueries((prevQueries) => ({
      ...prevQueries,
      [screen]: query,
    }));
  };

  const searchContextValues = {
    searchQueries,
    updateSearchQuery,
    editModalVisible,
    setEditModalVisible,
  };

  return (
    <SearchContext.Provider value={searchContextValues}>
      {children}
    </SearchContext.Provider>
  );
};

export default function useSearch() {
  return useContext(SearchContext);
}
