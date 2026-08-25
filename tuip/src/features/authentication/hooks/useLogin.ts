import { useState } from "react";
import { UserEntity } from "../models/User";
import { authAdapter } from "../adapters/AuthAdapter";
import { authService } from "../services/authService";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserEntity | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const credentials = authAdapter.toDto(email, password);
      const response = await authService.login(credentials);
      const userEntity = authAdapter.toEntity(response);

      setUser(userEntity);
      localStorage.setItem("token", response.token);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error Al iniciar sesion";
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  return { login, loading, error, user };
};
