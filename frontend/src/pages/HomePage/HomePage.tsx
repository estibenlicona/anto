import React from "react";
import { Link } from "react-router-dom";

export const HomePage: React.FC = () => {
  return (
    <div className="home">
      <h1>Bienvenido</h1>
      <Link to="/auth/login"> Iniciar Session</Link>
    </div>
  );
};
