import React from "react";
import { Link } from "react-router-dom";
import { Alert } from "@tuya-ui/components";

/** Con sesión pero sin el rol: aviso bajo la barra, sin mandar a iniciar sesión otra vez. */
export const ForbiddenPage: React.FC = () => (
  <Alert variant="warning" title="Sin permisos para esta sección">
    Tu cuenta tiene sesión, pero no un rol que permita entrar acá. Pedí acceso
    al administrador de tu área o{" "}
    <Link to="/" className="underline">
      volvé al portal
    </Link>
    .
  </Alert>
);
