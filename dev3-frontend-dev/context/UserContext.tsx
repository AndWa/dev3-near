import React, { useContext, useEffect, useState } from "react";
import { fetchUserControllerFindMe } from "../services/api/dev3Components";
import { User } from "../services/api/dev3Schemas";

interface UserContextValue {
  user: User | null;
  onLogin: (token: string) => void;
  onSignOut: () => void;
  getUser: () => void;
}

const UserContext = React.createContext<UserContextValue | null>(null);

export const UserContextProvider = ({ children }: any) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  const getUser = async () => {
    try {
      const userData = await fetchUserControllerFindMe({});
      localStorage.setItem("user", JSON.stringify(userData));
      setRoles(userData.roles);
      setUser(userData);
    } catch {
      setUser(null);
      setRoles([]);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await fetchUserControllerFindMe({});
        localStorage.setItem("user", JSON.stringify(userData));
        setRoles(userData.roles);
        setUser(userData);
      } catch {
        setUser(null);
        setRoles([]);
      }
    };

    if (token) {
      getUser();
    } else {
      setUser(null);
      setRoles([]);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        setToken(existingToken);
      }
    }

    if (!user) {
      const existing = localStorage.getItem("user");
      if (existing) {
        setUser(JSON.parse(existing));
      }
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        onLogin: (token: string) => {
          localStorage.setItem("token", token);
          setToken(token);
        },
        onSignOut: () => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
          setRoles([]);
        },
        getUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export function useUserContext() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }

  return context;
}
