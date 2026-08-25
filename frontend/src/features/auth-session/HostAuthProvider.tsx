import React, { useCallback, useMemo, useSyncExternalStore } from "react";
import { AuthContext } from "@app/providers/AuthContext";
import { deriveAuthSession } from "./deriveAuthSession";
import { ANONYMOUS_SESSION, type Session } from "./types";

/**
 * Lo que esta aplicación necesita del host que la aloja.
 *
 * Es a propósito lo más chico posible: la sesión actual, y avisar cuando
 * cambia. Nada más. El host puede tener su estado en zustand, en redux o en
 * lo que sea — mientras pueda ofrecer estas dos cosas, encaja.
 *
 * **No se recibe el store del host.** Compartirlo acoplaría los dos lados en
 * la forma del estado, la librería y su versión, los middlewares y la
 * serialización, y le daría a este microfrontend acceso a estado que no le
 * incumbe. Dos funciones sobreviven a que el host migre de librería; un store
 * compartido, no.
 *
 * **El transporte todavía no está definido** (ver el change
 * `add-auth-port-and-simulator`). Lo que sí está definido es el contenido: la
 * autorización de negocio se maneja con Entra ID, así que la sesión llega
 * como claims del token. Esta interfaz es lo que hay que negociar contra el
 * host cuando se defina cómo lo entrega.
 */
export interface HostSessionSource {
  /**
   * La sesión en este momento.
   *
   * Debe devolver **la misma referencia** mientras la sesión no cambie: se lee
   * con `useSyncExternalStore`, que compara por identidad para decidir si hay
   * que re-renderizar. Un objeto nuevo en cada llamada provoca un bucle de
   * renders. Es el requisito que hay que trasladarle al host al negociar el
   * contrato.
   */
  getSession: () => Session;
  /** Registra un aviso de cambio y devuelve cómo darlo de baja. */
  subscribe: (onChange: () => void) => () => void;
}

export interface HostAuthProviderProps {
  /**
   * Omitido, la sesión es anónima. Es el estado correcto mientras el host no
   * entregue nada: ausencia de sesión, no error.
   */
  source?: HostSessionSource;
  children: React.ReactNode;
}

/** Sin `source` no hay a qué suscribirse: la baja es un no-op. */
const noopUnsubscribe = () => {};
const getAnonymous = () => ANONYMOUS_SESSION;

/**
 * Traduce la sesión del host al puerto que consume la aplicación.
 *
 * Usa `useSyncExternalStore` y no estado propio sincronizado por efecto:
 * la sesión del host *es* un store externo, y este es el primitivo que React
 * tiene para leerlo. Evita además el desfase entre lo que el host ya cambió y
 * lo que esta aplicación todavía no re-renderizó.
 *
 * Mientras el transporte no exista, sin `source` el provider reporta sesión
 * anónima. Eso es deliberado: la aplicación tiene que comportarse bien ante
 * "todavía no hay sesión", que es también lo que pasa en el primer render
 * real antes de que el host resuelva la suya.
 */
export const HostAuthProvider: React.FC<HostAuthProviderProps> = ({
  source,
  children,
}) => {
  const subscribe = useCallback(
    (onChange: () => void) =>
      source ? source.subscribe(onChange) : noopUnsubscribe,
    [source]
  );
  const getSnapshot = useCallback(
    () => (source ? source.getSession() : ANONYMOUS_SESSION),
    [source]
  );

  const session = useSyncExternalStore(subscribe, getSnapshot, getAnonymous);

  const value = useMemo(() => deriveAuthSession(session, false), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
