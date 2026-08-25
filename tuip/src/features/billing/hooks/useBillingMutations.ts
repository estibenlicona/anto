import { useState } from "react";
import {
  billingService,
  type BillingAdjustmentDto,
  type PrefactureDto,
  type RegisterPrefactureRequest,
} from "../services/billingService";

export type BillingMutationResult =
  | { success: true; billing?: PrefactureDto; created?: PrefactureDto[] }
  | { success: false; error: string };

function message(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: string } } })?.response
    ?.data;
  if (data?.message) return data.message;
  return err instanceof Error ? err.message : fallback;
}

export const useBillingMutations = () => {
  const [busy, setBusy] = useState(false);

  const run = async (
    fn: () => Promise<{ billing?: PrefactureDto; created?: PrefactureDto[] }>,
    fallback: string
  ): Promise<BillingMutationResult> => {
    try {
      setBusy(true);
      return { success: true, ...(await fn()) };
    } catch (err) {
      return { success: false, error: message(err, fallback) };
    } finally {
      setBusy(false);
    }
  };

  return {
    busy,
    generate: (period: string) =>
      run(
        async () => ({ created: await billingService.generate(period) }),
        "Error al generar el esperado del mes"
      ),
    adjust: (id: string, adjustment: BillingAdjustmentDto) =>
      run(
        async () => ({
          billing: await billingService.adjust(id, adjustment),
        }),
        "Error al guardar el ajuste"
      ),
    removeAdjustment: (id: string) =>
      run(
        async () => ({
          billing: await billingService.removeAdjustment(id),
        }),
        "Error al quitar el ajuste"
      ),
    registerPrefacture: (id: string, document: RegisterPrefactureRequest) =>
      run(
        async () => ({
          billing: await billingService.registerPrefacture(id, document),
        }),
        "Error al registrar la prefactura"
      ),
    setPrefactured: (id: string, prefactured: number) =>
      run(
        async () => ({
          billing: await billingService.setPrefactured(id, prefactured),
        }),
        "Error al guardar el valor prefacturado"
      ),
    approve: (id: string, note?: string) =>
      run(
        async () => ({ billing: await billingService.approve(id, note) }),
        "Error al aprobar la prefactura"
      ),
    object: (id: string, reason: string) =>
      run(
        async () => ({ billing: await billingService.object(id, reason) }),
        "Error al objetar la prefactura"
      ),
  };
};
