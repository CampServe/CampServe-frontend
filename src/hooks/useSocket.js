import React, { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../utils/axios";
import useAuth from "./useAuth";
import * as NetInfo from "@react-native-community/netinfo";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socketTrigger, setSocketTrigger] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const { user } = useAuth();

  // useEffect(() => {
  //   if (user) {
  //     socket.connect();
  //  socket.on("connect", (data) => {
  //    // console.log("Connected to the backend");
  //    console.log(data);
  //  });
  //   } else {
  //     socket.disconnect();
  //   }
  // }, [user]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socketTrigger, isOffline }}>
      {children}
    </SocketContext.Provider>
  );
};

export default function useSocket() {
  return useContext(SocketContext);
}
