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
  //   socket.on("new_request", (newData) => {
  //     console.log(newData);
  //     //   setSocketTrigger(newData);
  //   });

  //   return () => {
  //     socket.off("new_request");
  //   };
  // }, []);

  // socket.on("new_request", (data) => {
  //   console.log(data);
  // });

  // socket.on("connect", (data) => {
  //   // console.log("Connected to the backend");
  //   console.log(data);
  // });

  useEffect(() => {
    if (user) {
      socket.connect();
      // socket.on("connect", (data) => {
      //   console.log(data);
      // });
    } else {
      socket.disconnect();
    }
  }, [user]);

  // useEffect(() => {
  //   if (user?.provider_id) {
  //     socket.emit("user_login", { provider_id: user.provider_id });
  //     console.log("Sent");
  //   }
  // }, [user?.provider_id]);

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
