import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Icon,
  useToast,
} from "@tuya-ui/components";
import { useLeadBreadcrumbTrailing } from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { useBilling } from "./hooks/useBilling";
import { useBillingMutations } from "./hooks/useBillingMutations";
import { PrefactureDetailPanel } from "./components/PrefactureDetailPanel";
import { AdjustLineDrawer } from "./components/AdjustLineDrawer";
import {
  BillingDecisionDialog,
  type BillingDecision,
} from "./components/BillingDecisionDialog";
import { RegisterInvoiceDrawer } from "./components/RegisterInvoiceDrawer";
import { EditInvoicedDialog } from "./components/EditInvoicedDialog";
import {
  toAdjustment,
  type AdjustmentFormValues,
} from "./components/adjustmentValidation";
import {
  money,
  periodLabel,
  signedMoney,
  STATUS_LABELS,
  STATUS_VARIANTS,
} from "./adapters/BillingAdapter";
import type {
  PrefactureDto,
  RegisterPrefactureRequest,
} from "./services/billingService";

const LIST_PATH = "/app/lead/facturacion";

/** "15 ago" a partir de una fecha ISO. */
const MONTH_ABBR = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];
function shortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_ABBR[(m ?? 1) - 1]}`;
}

const Metric: React.FC<{
  label: string;
  value: string;
  tone?: "default" | "ok" | "alert";
}> = ({ label, value, tone = "default" }) => (
  <Card>
    <CardBody className="flex flex-col gap-1">
      <span className="text-label uppercase text-neutral-subtle">{label}</span>
      <span
        className={
          tone === "alert"
            ? "text-heading-lg font-bold tabular-nums text-danger-default"
            : tone === "ok"
              ? "text-heading-lg font-bold tabular-nums text-success-default"
              : "text-heading-lg font-bold tabular-nums text-neutral-default"
        }
      >
        {value}
      </span>
    </CardBody>
  </Card>
);

export interface BillingDetailContainerProps {
  billingId: string;
}

export const BillingDetailContainer: React.FC<BillingDetailContainerProps> = ({
  billingId,
}) => {
  const { billing, loading, notFound, error, replace } = useBilling(billingId);
  const {
    adjust,
    removeAdjustment,
    registerPrefacture,
    setPrefactured,
    approve,
    object,
    busy,
  } = useBillingMutations();
  const { toast } = useToast();
  const navigate = useNavigate();

  useLeadBreadcrumbTrailing(
    billing ? `${billing.personName} · ${periodLabel(billing.period)}` : null
  );

  const [adjusting, setAdjusting] = useState<PrefactureDto | null>(null);
  const [adjustKey, setAdjustKey] = useState(0);
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [decision, setDecision] = useState<BillingDecision | null>(null);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceKey, setInvoiceKey] = useState(0);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [prefacturedOpen, setPrefacturedOpen] = useState(false);
  const [invoicedError, setInvoicedError] = useState<string | null>(null);

  const openAdjust = (target: PrefactureDto) => {
    setAdjusting(target);
    setAdjustError(null);
    setAdjustKey((k) => k + 1);
  };

  const handleAdjust = async (values: AdjustmentFormValues) => {
    if (!billing || !adjusting) return;
    setAdjustError(null);
    const result = await adjust(billing.id, toAdjustment(values));
    if (result.success && result.billing) {
      replace(result.billing);
      setAdjusting(null);
      toast({
        message: "Ajuste guardado",
        icon: <Icon name="status-success" size={16} />,
      });
    } else if (!result.success) {
      setAdjustError(result.error);
    }
  };

  const handleRemove = async () => {
    if (!billing) return;
    const result = await removeAdjustment(billing.id);
    if (result.success && result.billing) {
      replace(result.billing);
      toast({
        message: "Ajuste quitado",
        icon: <Icon name="status-success" size={16} />,
      });
    } else if (!result.success) {
      toast({
        message: result.error,
        icon: <Icon name="status-error" size={16} />,
      });
    }
  };

  const handleInvoice = async (invoice: RegisterPrefactureRequest) => {
    if (!billing) return;
    setInvoiceError(null);
    const result = await registerPrefacture(billing.id, invoice);
    if (result.success && result.billing) {
      replace(result.billing);
      setInvoiceOpen(false);
      toast({
        message: "Prefactura registrada",
        icon: <Icon name="status-success" size={16} />,
      });
    } else if (!result.success) {
      setInvoiceError(result.error);
    }
  };

  const handleInvoiced = async (invoiced: number) => {
    if (!billing) return;
    setInvoicedError(null);
    const result = await setPrefactured(billing.id, invoiced);
    if (result.success && result.billing) {
      replace(result.billing);
      setPrefacturedOpen(false);
      toast({
        message: "Valor prefacturado actualizado",
        icon: <Icon name="status-success" size={16} />,
      });
    } else if (!result.success) {
      setInvoicedError(result.error);
    }
  };

  const handleDecision = async (text: string) => {
    if (!billing || !decision) return;
    setDecisionError(null);
    const result =
      decision === "Approved"
        ? await approve(billing.id, text || undefined)
        : await object(billing.id, text);
    if (result.success && result.billing) {
      replace(result.billing);
      setDecision(null);
      toast({
        message:
          decision === "Approved"
            ? "Prefactura aprobada"
            : "Prefactura objetada",
        icon: <Icon name="status-success" size={16} />,
      });
    } else if (!result.success) {
      setDecisionError(result.error);
    }
  };

  if (notFound) {
    return (
      <EmptyState
        icon={<Icon name="search" size={32} />}
        title="No encontramos esa prefactura"
        description="Puede que se haya eliminado o que el enlace esté mal."
        action={
          <Button variant="secondary" onClick={() => navigate(LIST_PATH)}>
            Volver a Prefacturación
          </Button>
        }
      />
    );
  }
  if (error) {
    return (
      <Alert variant="danger" title="No se pudo cargar la prefactura">
        {error}
      </Alert>
    );
  }
  if (loading || !billing) {
    return (
      <p className="text-body-sm text-neutral-subtle">Cargando prefactura…</p>
    );
  }

  const approved = billing.status === "Approved";
  const objected = billing.status === "Objected";
  const hasInvoice = billing.document !== null;
  const editable = !approved && !objected;
  const conciliable = hasInvoice && editable;
  const difference = billing.difference ?? 0;
  // La diferencia se explica sola cuando hay un descuento que la prefactura no
  // reflejó: es el caso que este módulo existe para atrapar.
  const offending =
    difference !== 0 && billing.absenceDiscount !== null ? billing : null;
  const declaredMismatch =
    billing.document !== null &&
    billing.prefactured !== null &&
    billing.document.amount !== billing.prefactured;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-heading-lg font-semibold text-neutral-default">
              {billing.personName}
            </h1>
            <Badge variant={STATUS_VARIANTS[billing.status]}>
              {STATUS_LABELS[billing.status]}
            </Badge>
          </div>
          <p className="text-body-sm text-neutral-subtle">
            {billing.providerName} · {periodLabel(billing.period)} ·{" "}
            {billing.document
              ? `Prefactura ${billing.document.number}, recibida el ${shortDate(billing.document.receivedAt)}`
              : "Sin prefactura recibida"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!hasInvoice || objected ? (
            <Button
              variant="primary"
              onClick={() => {
                setInvoiceError(null);
                setInvoiceKey((k) => k + 1);
                setInvoiceOpen(true);
              }}
              iconBefore={<Icon name="document" size={20} />}
            >
              {objected ? "Registrar corregida" : "Registrar prefactura"}
            </Button>
          ) : (
            conciliable && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDecisionError(null);
                    setDecision("Objected");
                  }}
                  iconBefore={<Icon name="comment" size={20} />}
                >
                  Objetar con nota
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setDecisionError(null);
                    setDecision("Approved");
                  }}
                  iconBefore={<Icon name="check" size={20} />}
                >
                  Aprobar prefactura
                </Button>
              </>
            )
          )}
        </div>
      </div>

      {conciliable && difference !== 0 && offending && (
        <Alert
          variant="warning"
          title={`La prefactura no refleja el descuento de ${offending.personName}`}
        >
          Sus {offending.absenceDiscount?.businessDays}{" "}
          {offending.absenceDiscount?.businessDays === 1
            ? "día hábil de ausencia aprobada descuenta"
            : "días hábiles de ausencia aprobada descuentan"}{" "}
          {money(offending.absenceDiscount?.amount ?? 0)} y el proveedor propone
          cobrar la tarifa completa. Diferencia:{" "}
          <strong>{signedMoney(difference)}</strong>.
        </Alert>
      )}

      {declaredMismatch && billing.document && (
        <Alert
          variant="info"
          title="El valor declarado no cuadra con lo revisado"
        >
          La prefactura dice {money(billing.document.amount)} y lo que se está
          revisando es {money(billing.prefactured ?? 0)}. Revisa el desglose:
          puede traer conceptos que la plataforma no modela.
        </Alert>
      )}

      {objected && billing.objection && (
        <Alert variant="danger" title="Prefactura objetada">
          {billing.objection.reason} · Esperando la corregida del proveedor.
        </Alert>
      )}

      {approved && (
        <Alert variant="info" title="Prefactura aprobada">
          Las cifras quedaron congeladas con la aprobación.
          {billing.approvalNote
            ? ` Nota: ${billing.approvalNote}`
            : " Sin diferencias contra lo esperado."}
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          label="Prefacturado"
          value={
            billing.prefactured === null ? "—" : money(billing.prefactured)
          }
        />
        <Metric label="Esperado del período" value={money(billing.expected)} />
        <Metric
          label="Diferencia"
          value={
            billing.difference === null
              ? "—"
              : difference === 0
                ? money(0)
                : signedMoney(difference)
          }
          tone={
            billing.difference === null
              ? "default"
              : difference === 0
                ? "ok"
                : "alert"
          }
        />
      </div>

      <PrefactureDetailPanel
        prefacture={billing}
        editable={editable}
        onAdjust={() => openAdjust(billing)}
        onRemoveAdjustment={handleRemove}
        onEditPrefactured={() => {
          setInvoicedError(null);
          setPrefacturedOpen(true);
        }}
      />

      <p className="text-body-sm text-neutral-subtle">
        Las novedades no se digitan acá: sólo se comprueba que la prefactura las
        refleje. El descuento por ausencias se corrige aprobando o rechazando la
        ausencia, no en esta pantalla.
      </p>

      <AdjustLineDrawer
        key={adjustKey}
        open={adjusting !== null}
        onOpenChange={(open) => {
          if (!open) setAdjusting(null);
        }}
        line={adjusting}
        saving={busy}
        serverError={adjustError}
        onSubmit={handleAdjust}
      />
      <RegisterInvoiceDrawer
        key={invoiceKey}
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
        billing={billing}
        saving={busy}
        serverError={invoiceError}
        onSubmit={handleInvoice}
      />
      {prefacturedOpen && (
        <EditInvoicedDialog
          key={billing.id}
          open
          onOpenChange={(open) => {
            if (!open) setPrefacturedOpen(false);
          }}
          prefacture={billing}
          busy={busy}
          serverError={invoicedError}
          onConfirm={handleInvoiced}
        />
      )}
      <BillingDecisionDialog
        open={decision !== null}
        onOpenChange={(open) => {
          if (!open) setDecision(null);
        }}
        billing={billing}
        decision={decision}
        busy={busy}
        serverError={decisionError}
        onConfirm={handleDecision}
      />
    </div>
  );
};
