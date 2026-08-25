import React from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "./hooks/useLogin";
import { LoginForm } from "./components/LoginForm";

export const AuthenticationContainer: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useLogin();

  const handleLogin = async (email: string, pass: string) => {
    try {
      await login(email, pass);
      navigate("/app/dashboard");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="auth-container">
      <h1>Iniciar session</h1>
      <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
    </div>
  );
};
