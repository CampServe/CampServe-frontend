import React, { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../utils/axios";
import useAuth from "./useAuth";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socketTrigger, setSocketTrigger] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    socket.on("new_request", (newData) => {
      console.log(newData);
      //   setSocketTrigger(newData);
    });

    return () => {
      socket.off("new_request");
    };
  }, []);

  // useEffect(() => {
  //   if (user?.provider_id) {
  //     socket.emit("join_room", { provider_id: user.provider_id });
  //     console.log("Sent");
  //   }
  // }, [user?.provider_id]);

  return (
    <SocketContext.Provider value={socketTrigger}>
      {children}
    </SocketContext.Provider>
  );
};

export default function useSocket() {
  return useContext(SocketContext);
}
