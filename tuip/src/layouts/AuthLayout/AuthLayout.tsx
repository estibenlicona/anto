import React from "react";
import { Outlet } from "react-router-dom";

export const AuthLayout: React.FC = () => {
  return (
    <div className="auth-layout">
      <div className="auth-layout__container">
        <Outlet />
      </div>
    </div>
  );
};
