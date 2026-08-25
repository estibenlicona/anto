import { createContext, useContext } from "react";
import type { SimulatorProfile } from "./profiles";

/**
 * **Sólo desarrollo.** Ver `profiles.ts`.
 *
 * Los controles viven en un contexto aparte del puerto de sesión, y no
 * mezclados con él, para que sea imposible que una pantalla de negocio
 * termine consumiéndolos: el puerto no los expone, así que ni siquiera están
 * a la vista desde `useAuth()`.
 */
export interface SimulatorControls {
  profiles: SimulatorProfile[];
  activeProfileId: string;
  tokenExpired: boolean;
  selectProfile: (profileId: string) => void;
  setTokenExpired: (tokenExpired: boolean) => void;
  signOut: () => void;
}

export const SimulatorControlContext = createContext<
  SimulatorControls | undefined
>(undefined);

export const useSimulatorControls = (): SimulatorControls => {
  const context = useContext(SimulatorControlContext);
  if (!context) {
    throw new Error(
      "useSimulatorControls sólo puede usarse dentro del simulador"
    );
  }
  return context;
};
