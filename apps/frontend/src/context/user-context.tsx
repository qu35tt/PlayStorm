import { createContext, useContext, useState, type ReactNode } from "react";

type User = { username: string; avatarUrl: string } | null;

type UserContextType = {
  userCredentials: User;
  setUser: (user: User) => void;
  clearUser: () => void;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userCredentials, setUserState] = useState<User>(
    () => JSON.parse(sessionStorage.getItem("user") || "null")
  );

  const setUser = (user: User) => {
    setUserState(user);
    user
      ? sessionStorage.setItem("user", JSON.stringify(user))
      : sessionStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ userCredentials, setUser, clearUser: () => setUser(null) }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
};
