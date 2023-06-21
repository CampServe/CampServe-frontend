import React, { createContext, useContext, useEffect, useState } from "react";

const RatingContext = createContext({});

export const RatingProvider = ({ children }) => {
  const [averageRate, setAverageRate] = useState(0);
  const [newMessageTrigger, setNewMessageTrigger] = useState(false);

  useEffect(() => {
    const simulateNewMessage = () => {
      if (!newMessageTrigger) {
        setNewMessageTrigger(true);

        setTimeout(() => {
          setNewMessageTrigger(false);
        }, 2000);
      }
    };

    simulateNewMessage();
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
