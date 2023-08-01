import React, { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../utils/axios";
import axios from "../utils/axios";
import useAuth from "./useAuth";
import * as NetInfo from "@react-native-community/netinfo";
import * as Updates from "expo-updates";
import { Alert } from "react-native";

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
    const axiosInterceptor = axios.interceptors.response.use(
      (response) => {
        setIsOffline(false);
        return response;
      },
      (error) => {
        if (error.isAxiosError && !navigator.onLine) {
          setIsOffline(true);
        }
        return Promise.reject(error);
      }
    );

    const checkNetworkStatus = async () => {
      const state = await NetInfo.fetch();
      setIsOffline(!state.isConnected);
    };

    const networkStatusInterval = setInterval(checkNetworkStatus, 5000);

    return () => {
      axios.interceptors.response.eject(axiosInterceptor);
      clearInterval(networkStatusInterval);
    };
  }, []);

  // useEffect(() => {
  //   const reactToUpdates = async () => {
  //     Updates.addListener((event) => {
  //       if (event.type === Updates.UpdateEventType.UPDATE_AVAILABLE) {
  //         Alert.alert(
  //           "Update Available",
  //           "An update is available. Restart your app.",
  //           [
  //             {
  //               text: "Restart",
  //               onPress: () => {
  //                 Updates.reloadAsync();
  //               },
  //             },
  //           ]
  //         );
  //       }
  //     });
  //   };
  //   reactToUpdates();
  // }, []);

  return (
    <SocketContext.Provider value={{ socketTrigger, isOffline }}>
      {children}
    </SocketContext.Provider>
  );
};

export default function useSocket() {
  return useContext(SocketContext);
}
