import React, { createContext, useContext, useState, useMemo } from "react";
import axios from "../utils/axios";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [isLoadingSignup, setIsLoadingSignup] = useState(false);
  const [isLoadingVerify, setIsLoadingVerify] = useState(false);
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
      setIsLoadingLogin(false);
      throw new Error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsLoadingLogin(false);
    }
  };

  const studentVerification = async (email) => {
    setIsLoadingVerify(true);
    try {
      const response = await axios.post("/student_verification", { email });
      if (response.data.status === "OTP sent to email") {
        return true;
      } else {
        setError(response.data.status);
        return false;
      }
    } catch (error) {
      setError("An error occurred");
      return false;
    } finally {
      setIsLoadingVerify(false);
    }
  };

  const studentEmailVerification = async (email, otp) => {
    try {
      const response = await axios.post("/otp_verification", {
        email,
        otp,
      });
      if (response.data.status === "Email verification successful") {
        return true;
      } else {
        setError(response.data.status);
        return false;
      }
    } catch (error) {
      setError("An error occurred");
      return false;
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

  const signupAsProvider = async (user_id, providerData) => {
    try {
      const response = await axios.post(
        `/signup_as_provider/${user_id}`,
        providerData
      );
      console.log("Response data:", response.data);
      if (response.data.status === "Provider created with credentials") {
        setUser((prevUser) => ({
          ...prevUser,
          is_service_provider: true,
        }));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || "An error occurred");
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
      login,
      logout,
      userSignup,
      studentVerification,
      studentEmailVerification,
      signupAsProvider,
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
