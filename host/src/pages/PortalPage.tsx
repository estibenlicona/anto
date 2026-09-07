import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, CardBody, CardHeader } from "@tuya-ui/components";
import { useAuth } from "@app/providers/useAuth";
import { visibleModules } from "@features/modules/registry";

/** La entrada a los módulos que el rol de la persona permite. */
export const PortalPage: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const modules = useMemo(() => visibleModules(hasRole), [hasRole]);

  if (modules.length === 0) {
    return (
      <Alert variant="info" title="No tenés módulos disponibles">
        Tu cuenta tiene sesión pero ningún rol de la plataforma. Pedí acceso al
        administrador de tu área.
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((module) => (
        <Card key={module.id}>
          <CardHeader>{module.name}</CardHeader>
          <CardBody className="flex flex-col gap-4">
            <p className="text-body-sm text-neutral-subtle">
              {module.description}
            </p>
            <Button
              variant="secondary"
              className="self-start"
              onClick={() => navigate(module.basePath)}
            >
              Entrar
            </Button>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};
