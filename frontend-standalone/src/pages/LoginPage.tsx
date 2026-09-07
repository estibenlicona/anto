import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, CardBody, CardHeader } from "@tuya-ui/components";
import { PROFILES } from "../session/profiles";
import { login } from "../session/store";

/**
 * El inicio de sesión de la versión independiente: elegir con quién entrar.
 * Reemplaza al proveedor de identidad —acá no hay contraseñas ni Entra—, y
 * al entrar deja a la persona donde quería ir.
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo =
    new URLSearchParams(location.search).get("returnTo") ?? "/app";

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-heading-lg text-neutral-default">
          Gestión de Capacidad · standalone
        </h1>
        <p className="text-body-sm text-neutral-subtle">
          Versión independiente con datos de mocks. Elegí con quién entrar: la
          sesión, los permisos de sección y el alcance del chapter son los del
          perfil.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {PROFILES.map((profile) => (
          <Card key={profile.id}>
            <CardHeader>{profile.label}</CardHeader>
            <CardBody className="flex flex-col gap-3">
              <p className="text-body-sm text-neutral-subtle">
                {profile.description}
              </p>
              <Button
                variant={profile.id === "admin" ? "primary" : "secondary"}
                className="self-start"
                onClick={() => {
                  login(profile.id);
                  navigate(returnTo, { replace: true });
                }}
              >
                Entrar como {profile.name.split(" ")[0]}
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </main>
  );
};
