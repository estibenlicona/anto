import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Icon, Select, useToast } from "@tuya-ui/components";
import { useBillingPeriod } from "./hooks/useBillingPeriod";
import { useBillingMutations } from "./hooks/useBillingMutations";
import { BillingStatsCards } from "./components/BillingStatsCards";
import { BillingList, billingPath } from "./components/BillingList";
import {
  BillingDecisionDialog,
  type BillingDecision,
} from "./components/BillingDecisionDialog";
import { RegisterInvoiceDrawer } from "./components/RegisterInvoiceDrawer";
import {
  availablePeriods,
  currentPeriod,
  periodLabel,
} from "./adapters/BillingAdapter";
import type { BillingRow } from "./adapters/BillingAdapter";
import type {
  PrefactureDto,
  RegisterPrefactureRequest,
} from "./services/billingService";

const PERIOD_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export const BillingContainer: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const anchor = currentPeriod();
  const requested = params.get("period") ?? "";
  const period = PERIOD_RE.test(requested) ? requested : anchor;
  const periods = availablePeriods(anchor);

  const {
    rows: allRows,
    stats,
    loading,
    error,
    refetch,
  } = useBillingPeriod(period);

  // El proveedor deja de ser la unidad, pero sigue siendo con quien se reclama.
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const providers = [...new Set(allRows.map((r) => r.providerName))]
    .filter(Boolean)
    .sort();
  const rows =
    selectedProviders.length === 0
      ? allRows
      : allRows.filter((r) => selectedProviders.includes(r.providerName));
  const { generate, registerPrefacture, approve, object, busy } =
    useBillingMutations();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [decisionTarget, setDecisionTarget] = useState<{
    billing: PrefactureDto;
    decision: BillingDecision;
  } | null>(null);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [invoiceTarget, setInvoiceTarget] = useState<PrefactureDto | null>(
    null
  );
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  const onPeriodChange = (next: string) =>
    setParams(next === anchor ? {} : { period: next });

  // Sin esperado generado: es lo que el botón de generar tiene que crear.
  const withoutExpected = rows.filter((r) => r.status === "None").length;
  // Sin esperado generado no hay dónde registrar una prefactura.
  const canRegisterAny = rows.some((r) => r.canRegisterPrefacture);

  const handleGenerate = async () => {
    const result = await generate(period);
    if (result.success) {
      const n = result.created?.length ?? 0;
      toast({
        message:
          n === 0
            ? "Todos los proveedores ya tenían su esperado"
            : `Esperado generado para ${n} ${n === 1 ? "proveedor" : "proveedores"}`,
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
    } else {
      toast({
        message: result.error,
        icon: <Icon name="status-error" size={16} />,
      });
    }
  };

  const openDecision = (row: BillingRow, decision: BillingDecision) => {
    if (!row) return;
    setDecisionTarget({ billing: row, decision });
    setDecisionError(null);
  };

  const handleDecision = async (text: string) => {
    if (!decisionTarget) return;
    setDecisionError(null);
    const { billing, decision } = decisionTarget;
    const result =
      decision === "Approved"
        ? await approve(billing.id, text || undefined)
        : await object(billing.id, text);
    if (result.success) {
      setDecisionTarget(null);
      toast({
        message:
          decision === "Approved"
            ? "Prefactura aprobada"
            : "Prefactura objetada",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
    } else {
      setDecisionError(result.error);
    }
  };

  const openInvoice = (row: BillingRow) => {
    if (!row) return;
    setInvoiceTarget(row);
    setInvoiceError(null);
  };

  const handleInvoice = async (invoice: RegisterPrefactureRequest) => {
    if (!invoiceTarget) return;
    setInvoiceError(null);
    const result = await registerPrefacture(invoiceTarget.id, invoice);
    if (result.success) {
      setInvoiceTarget(null);
      toast({
        message: "Prefactura registrada",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
    } else {
      setInvoiceError(result.error);
    }
  };

  /** Con una sola prefactura por registrar, el primario va directo a ella. */
  const soleRegistrable = rows.find((r) => r.canRegisterPrefacture);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          {/* El período va con el título, no entre los filtros del listado:
              no acota lo que se lista, decide de qué mes es todo lo que la
              pantalla muestra, indicadores incluidos. */}
          <div className="flex flex-wrap items-end gap-3">
            <h1 className="text-heading-lg font-semibold text-neutral-default">
              Prefacturas
            </h1>
            {/* Etiqueta visible, no aria-label: el Select del sistema de diseño
                no reenvía aria-label, así que el control quedaría sin nombre
                accesible y nadie se enteraría. */}
            <Select
              label="Período"
              options={periods.map((value) => ({
                value,
                label: periodLabel(value),
              }))}
              value={period}
              onValueChange={onPeriodChange}
              className="w-48"
            />
          </div>
          <p className="text-body-sm text-neutral-subtle">
            Revisa lo que cada proveedor propone cobrar por cada persona, contra
            su tarifa, sus ausencias y sus horas extra del período.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleGenerate}
            isLoading={busy}
            disabled={loading || withoutExpected === 0}
            iconBefore={<Icon name="calibration" size={20} />}
          >
            Generar el esperado del mes
          </Button>
          <Button
            variant="primary"
            onClick={() => soleRegistrable && openInvoice(soleRegistrable)}
            disabled={loading || !canRegisterAny}
            iconBefore={<Icon name="document" size={20} />}
          >
            Registrar prefactura
          </Button>
        </div>
      </div>
      <BillingStatsCards stats={stats} period={period} loading={loading} />
      <BillingList
        rows={rows}
        loading={loading}
        error={error}
        onRetry={refetch}
        providers={providers}
        selectedProviders={selectedProviders}
        onProvidersChange={setSelectedProviders}
        onOpen={(row) => navigate(billingPath(row.id))}
        onRegisterInvoice={openInvoice}
        onApprove={(row) => openDecision(row, "Approved")}
        onObject={(row) => openDecision(row, "Objected")}
      />
      <BillingDecisionDialog
        open={decisionTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDecisionTarget(null);
        }}
        billing={decisionTarget?.billing ?? null}
        decision={decisionTarget?.decision ?? null}
        busy={busy}
        serverError={decisionError}
        onConfirm={handleDecision}
      />
      {invoiceTarget && (
        <RegisterInvoiceDrawer
          key={invoiceTarget.id}
          open={invoiceTarget !== null}
          onOpenChange={(open) => {
            if (!open) setInvoiceTarget(null);
          }}
          providerName={invoiceTarget.providerName}
          period={invoiceTarget.period}
          expected={invoiceTarget.expected}
          isCorrection={invoiceTarget.status === "Objected"}
          saving={busy}
          serverError={invoiceError}
          onSubmit={handleInvoice}
        />
      )}
    </div>
  );
};
