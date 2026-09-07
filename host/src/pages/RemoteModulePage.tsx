import React, { Suspense, useState } from "react";
import { loadRemote, registerRemotes } from "@module-federation/runtime";
import { Alert, Button } from "@tuya-ui/components";
import { useAuth } from "@app/providers/useAuth";
import type { ModuleDefinition } from "@features/modules/registry";

/** Alto de la barra del host en px; los módulos ocupan el resto. */
export const HOST_BAR_HEIGHT = 56;

/**
 * Las props que el contrato de montaje entrega a un módulo federado. La
 * contraparte vive en el módulo (interfaz estructural equivalente): cuatro
 * campos no ameritan un paquete compartido.
 */
interface FederatedModuleProps {
  source: {
    getSession: () => unknown;
    subscribe: (onChange: () => void) => () => void;
  };
  acquireToken: (scopes: string[]) => Promise<string | null>;
  basePath: string;
  topOffset: number;
}

const registered = new Set<string>();

/** Registra el remote en el runtime de federation una sola vez por sesión. */
function ensureRemote(name: string, entry: string): void {
  if (registered.has(name)) return;
  // El remote de Vite es un módulo ES: sin `type: "module"` el runtime lo
  // inyectaría como script clásico y fallaría con "Cannot use import…".
  registerRemotes([{ name, entry, type: "module" }]);
  registered.add(name);
}

function lazyRemote(module: ModuleDefinition) {
  return React.lazy(async () => {
    ensureRemote(module.id, module.remoteEntry!);
    const loaded = await loadRemote<{
      default: React.ComponentType<FederatedModuleProps>;
    }>(`${module.id}/module`);
    if (!loaded) throw new Error(`El remote de ${module.name} no exporta nada`);
    return { default: loaded.default };
  });
}

/**
 * Si el remote no carga (red, deploy a medias), el aviso vive bajo la barra
 * intacta y ofrece reintentar; el resto del host no se entera.
 */
class RemoteBoundary extends React.Component<
  { moduleName: string; onRetry: () => void; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="p-6">
        <Alert
          variant="danger"
          title={`${this.props.moduleName} no pudo cargarse`}
        >
          <p className="mb-3">
            El módulo no respondió. Puede ser un problema de red o un despliegue
            en curso.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              this.setState({ failed: false });
              this.props.onRetry();
            }}
          >
            Reintentar
          </Button>
        </Alert>
      </div>
    );
  }
}

/**
 * Monta el remote declarado por el módulo del registro y le entrega el
 * contrato: la fuente de sesión del host, la obtención de tokens, su ruta
 * base y el alto de la barra.
 */
export const RemoteModulePage: React.FC<{ module: ModuleDefinition }> = ({
  module,
}) => {
  const auth = useAuth();
  // El lazy vive en estado: reintentar lo recrea desde el evento (no en
  // render), así el remote se vuelve a pedir de verdad.
  const [Remote, setRemote] = useState(() => lazyRemote(module));

  return (
    <RemoteBoundary
      moduleName={module.name}
      onRetry={() => setRemote(() => lazyRemote(module))}
    >
      <Suspense
        fallback={
          <div className="flex items-center gap-3 p-6 text-neutral-subtle">
            Cargando {module.name}…
          </div>
        }
      >
        <Remote
          source={auth.source}
          acquireToken={auth.acquireToken}
          basePath={module.basePath}
          topOffset={HOST_BAR_HEIGHT}
        />
      </Suspense>
    </RemoteBoundary>
  );
};
