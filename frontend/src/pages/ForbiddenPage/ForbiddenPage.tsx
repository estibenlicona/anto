import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, EmptyState, Icon } from "@tuya-ui/components";
import { useAuth } from "@features/authentication/index";

/**
 * Adonde caen los usuarios con sesión pero sin el rol que la ruta exige.
 *
 * No ofrece "iniciar sesión": el usuario ya lo hizo, y repetirlo no le va a
 * dar el rol. Lo que ofrece es volver a donde sí puede estar, y su propio
 * usuario a la vista para que sepa con qué cuenta está entrando — que suele
 * ser la causa cuando alguien tiene varias.
 */
export const ForbiddenPage: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const username =
    session.status === "authenticated" ? session.user.username : null;

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <EmptyState
        icon={<Icon name="status-locked" size={32} />}
        title="No tienes permisos para esta pantalla"
        description={
          username
            ? `Tu sesión (${username}) no tiene el rol que esta pantalla requiere. Si crees que debería tenerlo, solicítalo al administrador de la plataforma.`
            : "Tu sesión no tiene el rol que esta pantalla requiere."
        }
        action={
          <Button variant="primary" onClick={() => navigate("/")}>
            Volver al inicio
          </Button>
        }
      />
    </div>
  );
};
