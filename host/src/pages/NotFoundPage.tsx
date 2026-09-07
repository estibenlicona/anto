import React from "react";
import { Link } from "react-router-dom";
import { Alert } from "@tuya-ui/components";

export const NotFoundPage: React.FC = () => (
  <Alert variant="warning" title="Esta ruta no existe">
    No corresponde a ningún módulo ni pantalla de la plataforma.{" "}
    <Link to="/" className="underline">
      Volver al portal
    </Link>
    .
  </Alert>
);
