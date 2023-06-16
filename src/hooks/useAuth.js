import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import axios from "../utils/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [isLoadingSignup, setIsLoadingSignup] = useState(false);
  const [isLoadingVerify, setIsLoadingVerify] = useState(false);
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [isLoadingLogout, setIsLoadingLogout] = useState(false);
  const [isSwitchingAcount, setIsSwitchingAcount] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkTokenExpiration = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const { status, expiration, ...userData } = jwtDecode(token);
          const expirationDate = new Date(expiration);
          const currentDate = new Date();

          if (currentDate <= expirationDate) {
            axios.defaults.headers.common["Authorization"] = `${token}`;
            setUser(userData);
          } else {
            delete axios.defaults.headers.common["Authorization"];
            setUser(null);
            await AsyncStorage.removeItem("token");
          }
        }
      } catch (error) {
        console.log("Error checking token expiration:", error);
      } finally {
        setIsLoadingToken(false);
      }
    };

    checkTokenExpiration();
  }, []);

  const login = async (credentials, isServiceProviderLogin) => {
    try {
      setIsLoadingLogin(true);
      setError(null);

      const route = isServiceProviderLogin
        ? "/login_as_provider"
        : "/user_login";

      const tokenResponse = await axios.post(route, credentials);
      const tokenData = tokenResponse.data.token;

      if (tokenData) {
        const response = jwtDecode(tokenData);

        if (
          ["Login successful", "Provider login successful"].includes(
            response.status
          )
        ) {
          const { status, expiration, ...userData } = response;
          axios.defaults.headers.common["Authorization"] = `${tokenData}`;

          try {
            await AsyncStorage.setItem("token", tokenData);
          } catch (storageError) {
            console.log("Error storing token in AsyncStorage:", storageError);
          }

          setUser(userData);
          return true;
        } else {
          setError(response.status);
          return false;
        }
      } else {
        setError(tokenResponse.data || tokenResponse.data.status);
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

  const switchAccount = async () => {
    setIsSwitchingAcount(true);
    const route =
      user.account_type == "regular user"
        ? "/switch_to_provider"
        : "/switch_to_user";

    try {
      const tokenResponse = await axios.get(route);
      const tokenData = tokenResponse.data.token;
      if (tokenData) {
        const response = jwtDecode(tokenData);

        const { expiration, ...userData } = response;
        axios.defaults.headers.common["Authorization"] = `${tokenData}`;
        try {
          await AsyncStorage.setItem("token", tokenData);
        } catch (storageError) {
          console.log("Error storing token in AsyncStorage:", storageError);
        }

        setUser(userData);
        return true;
      } else {
        setError(response.status);
        return false;
      }
    } catch (error) {
      console.log(error);
      setError("An error occurred");
    } finally {
      setIsSwitchingAcount(false);
    }
  };

  const logout = async () => {
    setIsLoadingLogout(true);
    const route =
      user.account_type == "regular user" ? "/logout" : "/provider_logout";
    try {
      const response = await axios.post(route);
      if (response.data.message === "Logout successful") {
        AsyncStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        setUser(null);
      } else {
        setError("Logout failed");
      }
    } catch (error) {
      console.log(error);
      setError("An error occurred");
    } finally {
      setIsLoadingLogout(false);
    }
  };

  const contextValue = useMemo(
    () => ({
      user,
      isLoadingLogin,
      isLoadingSignup,
      isLoadingVerify,
      isLoadingLogout,
      isSwitchingAcount,
      error,
      login,
      logout,
      userSignup,
      studentVerification,
      studentEmailVerification,
      signupAsProvider,
      switchAccount,
      isLoadingToken,
    }),
    [
      user,
      isLoadingLogin,
      isLoadingSignup,
      isLoadingVerify,
      isLoadingToken,
      error,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}
