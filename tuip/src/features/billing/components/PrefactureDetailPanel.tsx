import React from "react";
import { Button, Card, CardBody, Icon } from "@tuya-ui/components";
import {
  IMPUTATION_FIELDS,
  REASON_LABELS,
  money,
  periodLabel,
  signedMoney,
} from "../adapters/BillingAdapter";
import type { PrefactureDto } from "../services/billingService";

const SECONDARY_TEXT = "text-body-sm text-neutral-subtle";

/** Una fila etiqueta / valor de las dos tablas de este panel. */
const Row: React.FC<{
  label: string;
  children: React.ReactNode;
  hint?: string;
}> = ({ label, children, hint }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-neutral-subtle py-2 last:border-0">
    <span className={SECONDARY_TEXT}>
      {label}
      {hint && <span className="ml-1 text-neutral-subtlest">{hint}</span>}
    </span>
    <span className="text-body tabular-nums text-neutral-default">
      {children}
    </span>
  </div>
);

/**
 * Un dato de imputación que nadie llenó. Se dice, no se deja en blanco: en un
 * control de ejecución un campo vacío y uno sin llenar se leen igual y no son
 * lo mismo, y el que falta es el que hay que ir a buscar.
 */
const Missing: React.FC = () => (
  <span className="inline-flex items-center gap-1 text-body-sm text-warning-default">
    <Icon name="status-warning" size={16} />
    Falta
  </span>
);

export interface PrefactureDetailPanelProps {
  prefacture: PrefactureDto;
  editable: boolean;
  onAdjust: () => void;
  onRemoveAdjustment: () => void;
  onEditPrefactured: () => void;
}

export const PrefactureDetailPanel: React.FC<PrefactureDetailPanelProps> = ({
  prefacture: p,
  editable,
  onAdjust,
  onRemoveAdjustment,
  onEditPrefactured,
}) => (
  <div className="grid gap-4 lg:grid-cols-2">
    <Card>
      <CardBody className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-label uppercase text-neutral-subtle">
            Cálculo del período
          </span>
          <Icon name="fte" size={16} className="text-neutral-subtle" />
        </div>

        <Row label="Tarifa del mes">{money(p.monthlyCost)}</Row>

        <Row
          label="Ausencias aprobadas"
          hint={
            p.absenceDiscount
              ? `· ${p.absenceDiscount.businessDays} ${
                  p.absenceDiscount.businessDays === 1 ? "día" : "días"
                }`
              : undefined
          }
        >
          {p.absenceDiscount ? `−${money(p.absenceDiscount.amount)}` : "—"}
        </Row>

        <Row
          label="Ajuste"
          hint={
            p.adjustment ? `· ${REASON_LABELS[p.adjustment.reason]}` : undefined
          }
        >
          <span className="flex items-center gap-2">
            {p.adjustment ? signedMoney(p.adjustment.amount) : "—"}
            {editable &&
              (p.adjustment ? (
                <Button
                  variant="subtle"
                  size="small"
                  onClick={onRemoveAdjustment}
                >
                  Quitar
                </Button>
              ) : (
                <Button variant="subtle" size="small" onClick={onAdjust}>
                  Ajustar
                </Button>
              ))}
          </span>
        </Row>

        <Row label="Esperado">
          <b className="font-semibold">{money(p.expected)}</b>
        </Row>

        <Row label="Prefacturado">
          <span className="flex items-center gap-2">
            {p.prefactured === null ? "—" : money(p.prefactured)}
            {editable && p.document !== null && (
              <Button variant="subtle" size="small" onClick={onEditPrefactured}>
                Corregir
              </Button>
            )}
          </span>
        </Row>

        <Row label="Diferencia">
          <b
            className={`font-semibold ${
              p.difference === null || p.difference === 0
                ? "text-neutral-default"
                : "text-warning-default"
            }`}
          >
            {p.difference === null
              ? "—"
              : p.difference === 0
                ? money(0)
                : signedMoney(p.difference)}
          </b>
        </Row>
      </CardBody>
    </Card>

    <Card>
      <CardBody className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-label uppercase text-neutral-subtle">
            Imputación
          </span>
          <Icon name="document" size={16} className="text-neutral-subtle" />
        </div>

        {p.document === null ? (
          <p className={`${SECONDARY_TEXT} py-2`}>
            La prefactura todavía no llegó. Cuando se registre, acá se ve contra
            qué se imputa y con qué orden se paga.
          </p>
        ) : (
          <>
            <Row label="Número de prefactura">{p.document.number}</Row>
            <Row label="Fecha de recibida">{p.document.receivedAt}</Row>
            <Row label="Mes">{periodLabel(p.period)}</Row>
            <Row label="Valor total">
              {money(p.document.amount)}{" "}
              <span className={SECONDARY_TEXT}>{p.document.currency}</span>
            </Row>
            {IMPUTATION_FIELDS.map((f) => (
              <Row key={f.key} label={f.label}>
                {p.document!.imputation[f.key] ?? <Missing />}
              </Row>
            ))}
          </>
        )}
      </CardBody>
    </Card>
  </div>
);
