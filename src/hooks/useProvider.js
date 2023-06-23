import React, { createContext, useContext, useEffect, useState } from "react";

const RatingContext = createContext({});

export const RatingProvider = ({ children }) => {
  const [averageRate, setAverageRate] = useState(0);
  const [newMessageTrigger, setNewMessageTrigger] = useState(false);

  useEffect(() => {
    if (newMessageTrigger) {
      setNewMessageTrigger(false);
    }
  }, [newMessageTrigger]);

  return (
    <RatingContext.Provider
      value={{
        averageRate,
        setAverageRate,
        newMessageTrigger,
        setNewMessageTrigger,
      }}
    >
      {children}
    </RatingContext.Provider>
  );
};

export default function useProvider() {
  return useContext(RatingContext);
}
