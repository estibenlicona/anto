import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Icon, useToast } from "@tuya-ui/components";
import { useLeadBreadcrumbActions } from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { MonthNav } from "@shared/components/MonthNav";
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
  periodTitle,
  shiftPeriod,
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
  // Búsqueda y paginación en cliente: el período ya trae todas sus filas de
  // una vez, así que no hay ida al backend que ahorrar. La página vuelve a 1
  // cada vez que cambia lo que se busca, se filtra o el mes.
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const needle = search.trim().toLowerCase();
  const rows = allRows.filter(
    (r) =>
      (selectedProviders.length === 0 ||
        selectedProviders.includes(r.providerName)) &&
      (needle === "" ||
        [r.personName, r.providerName, r.costObjectText].some((text) =>
          text.toLowerCase().includes(needle)
        ))
  );
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = rows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const onSearchChange = (next: string) => {
    setSearch(next);
    setPage(1);
  };
  const onProvidersChange = (next: string[]) => {
    setSelectedProviders(next);
    setPage(1);
  };
  const onPageSizeChange = (next: number) => {
    setPageSize(next);
    setPage(1);
  };
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

  const onPeriodChange = (next: string) => {
    setParams(next === anchor ? {} : { period: next });
    setPage(1);
  };

  // Las acciones miran el período entero, no lo que la búsqueda o el filtro
  // dejan a la vista: generar y registrar actúan sobre el mes, y esconder
  // una fila no debería apagar el botón.
  // Sin esperado generado: es lo que el botón de generar tiene que crear.
  const withoutExpected = allRows.filter((r) => r.status === "None").length;
  // Sin esperado generado no hay dónde registrar una prefactura.
  const canRegisterAny = allRows.some((r) => r.canRegisterPrefacture);

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
  const soleRegistrable = allRows.find((r) => r.canRegisterPrefacture);

  // Sin encabezado de módulo: el nombre de la pantalla ya lo da el breadcrumb
  // del shell. El período no es un filtro de la tabla —decide de qué mes es
  // todo lo que la pantalla muestra, cards incluidas—, así que sube a la
  // franja del breadcrumb como navegador de mes, igual que en Ausencias, y
  // con él las dos acciones de la pantalla. Tamaño small porque la franja es
  // una banda de navegación, no un encabezado. El navegador se acota al rango
  // que antes ofrecía el selector: el mes en curso y los cinco anteriores.
  const oldest = periods[periods.length - 1];
  useLeadBreadcrumbActions(
    <div className="flex items-center gap-2">
      <MonthNav
        title={periodTitle(period)}
        onPrevious={() => onPeriodChange(shiftPeriod(period, -1))}
        onNext={() => onPeriodChange(shiftPeriod(period, 1))}
        previousDisabled={period <= oldest}
        nextDisabled={period >= anchor}
      />
      <Button
        variant="secondary"
        size="small"
        onClick={handleGenerate}
        isLoading={busy}
        disabled={loading || withoutExpected === 0}
        iconBefore={<Icon name="calibration" size={16} />}
      >
        Generar el esperado del mes
      </Button>
      <Button
        variant="primary"
        size="small"
        onClick={() => soleRegistrable && openInvoice(soleRegistrable)}
        disabled={loading || !canRegisterAny}
        iconBefore={<Icon name="document" size={16} />}
      >
        Registrar prefactura
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <BillingStatsCards stats={stats} period={period} loading={loading} />
      <BillingList
        rows={pageRows}
        loading={loading}
        error={error}
        onRetry={refetch}
        search={search}
        onSearchChange={onSearchChange}
        providers={providers}
        selectedProviders={selectedProviders}
        onProvidersChange={onProvidersChange}
        page={currentPage}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={onPageSizeChange}
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
          billing={invoiceTarget}
          saving={busy}
          serverError={invoiceError}
          onSubmit={handleInvoice}
        />
      )}
    </div>
  );
};
