import React, { createContext, useContext, useState } from "react";

const RatingContext = createContext({});

export const RatingProvider = ({ children }) => {
  const [averageRate, setAverageRate] = useState(0);

  return (
    <RatingContext.Provider value={{ averageRate, setAverageRate }}>
      {children}
    </RatingContext.Provider>
  );
};

export default function useProvider() {
  return useContext(RatingContext);
}
