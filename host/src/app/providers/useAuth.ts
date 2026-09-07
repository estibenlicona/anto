import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import type { HostAuth } from "@features/auth-session";

export const useAuth = (): HostAuth => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an auth provider");
  }
  return context;
};
