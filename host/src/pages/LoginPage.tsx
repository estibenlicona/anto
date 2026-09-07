import React from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Button, Card, CardBody, CardHeader } from "@tuya-ui/components";
import { useAuth } from "@app/providers/useAuth";
import { sanitizeReturnTo } from "@features/auth-session";
import { PRODUCT_NAME } from "@layouts/hostIdentity";

/**
 * La única pantalla fuera de la barra. No pide credenciales: las pide Entra.
 * Acá sólo se ofrece el botón que lleva al proveedor, recordando a dónde
 * volver.
 */
export const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [params] = useSearchParams();
  const returnTo = sanitizeReturnTo(params.get("returnTo")) ?? "/";

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to={returnTo} replace />;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>{PRODUCT_NAME}</CardHeader>
        <CardBody className="flex flex-col gap-4">
          <p className="text-body-sm text-neutral-subtle">
            Ingresá con tu cuenta corporativa de Tuya para entrar a los módulos
            de la plataforma.
          </p>
          <Button
            variant="primary"
            className="self-start"
            onClick={() => login(returnTo)}
          >
            Iniciar sesión con Tuya
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};
