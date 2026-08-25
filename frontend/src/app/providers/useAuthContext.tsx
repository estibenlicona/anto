import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthSession } from "@features/auth-session";

export const useAuthContext = (): AuthSession => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within an auth provider");
  }
  return context;
};
