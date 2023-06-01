import React, { createContext, useContext, useState, useMemo } from "react";
import axios from "../utils/axios";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [isLoadingSignup, setIsLoadingSignup] = useState(false);
  const [isLoadingVerify, setIsLoadingVerify] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(null);

  const login = async (credentials, isServiceProviderLogin) => {
    try {
      setIsLoadingLogin(true);
      setError(null);

      const route = isServiceProviderLogin
        ? "/login/service-provider"
        : "/user_login";
      const response = await axios.post(route, credentials);

      if (response.data.status === "Login successful") {
        const { status, ...userData } = response.data;
        setUser(userData);
        return true;
      } else {
        setError(response.data);
        return false;
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      throw new Error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsLoadingLogin(false);
    }
  };

  const studentVerification = async (credentials) => {
    try {
      setIsLoadingVerify(true);
      setError(null);

      const response = await axios.post("/student_verification", credentials);
      if (response.data.status === "Student") {
        setIsVerified(true);
      } else {
        setIsVerified(false);
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoadingVerify(false);
      setError(error.response?.data?.message || "An error occurred");
    }
  };

  const userSignup = async (userData) => {
    try {
      setIsLoadingSignup(true);
      setError(null);

      const response = await axios.post("/add_user", userData);
      if (response.data.status === "User created") {
        setIsLoadingSignup(false);
        return true;
      } else {
        setIsLoadingSignup(false);
        setError(response.data.status);
        return false;
      }
    } catch (error) {
      setIsLoadingSignup(false);
      setError(error.response?.data?.message || "An error occurred");
      return false;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
    } catch (error) {
      console.log(error);
      setError("An error occurred");
    }
  };

  const contextValue = useMemo(
    () => ({
      user,
      isLoadingLogin,
      isLoadingSignup,
      isLoadingVerify,
      error,
      isVerified,
      login,
      logout,
      userSignup,
      studentVerification,
    }),
    [user, isLoadingLogin, isLoadingSignup, isLoadingVerify, error]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}
