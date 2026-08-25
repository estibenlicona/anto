import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, Button, EmptyState, Icon, useToast } from "@tuya-ui/components";
import { useCapacityOverview } from "@features/control-tower/hooks/useCapacityOverview";
import {
  currentMonthKey,
  monthLabel,
  shiftMonth,
  type Absence,
} from "./adapters/AbsenceAdapter";
import { monthBounds } from "./services/businessDays";
import { useAbsencesMonth } from "./hooks/useAbsencesMonth";
import { useAbsenceMutations } from "./hooks/useAbsenceMutations";
import { AbsencesHeader } from "./components/AbsencesHeader";
import { AbsencesStatsCards } from "./components/AbsencesStatsCards";
import { AbsencesTable } from "./components/AbsencesTable";
import { ApproveAbsenceDialog } from "./components/ApproveAbsenceDialog";
import { RegisterAbsenceDrawer } from "./components/RegisterAbsenceDrawer";
import { RejectAbsenceDrawer } from "./components/RejectAbsenceDrawer";
import type { CreateAbsenceRequest } from "./services/absenceService";

export const AbsencesContainer: React.FC = () => {
  // El mes visible vive en la URL (?mes=YYYY-MM): un enlace compartido abre
  // el mismo mes. Un valor inválido cae al mes corriente sin romper nada.
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("mes");
  const monthKey =
    requested && monthBounds(requested) ? requested : currentMonthKey();

  const { month, loading, error, refetch } = useAbsencesMonth(monthKey);
  // Las personas del alta salen del resumen del chapter, como en el backlog.
  const { overview, loading: peopleLoading } = useCapacityOverview();
  const { saving, create, approve, reject } = useAbsenceMutations();
  const { toast } = useToast();

  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerKey, setRegisterKey] = useState(0);

  const [approveFor, setApproveFor] = useState<Absence | null>(null);
  const [rejectFor, setRejectFor] = useState<Absence | null>(null);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const goToMonth = (key: string) => setSearchParams({ mes: key });

  const openRegister = () => {
    setRegisterError(null);
    setRegisterKey((key) => key + 1);
    setRegisterOpen(true);
  };

  const handleRegister = async (request: CreateAbsenceRequest) => {
    setRegisterError(null);
    const result = await create(request);
    if (result.success) {
      setRegisterOpen(false);
      toast({
        message: "Ausencia registrada",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
    } else if (result.error) {
      setRegisterError(result.error);
    }
  };

  const handleApprove = async (absence: Absence) => {
    const result = await approve(absence.id);
    if (result.success) {
      setApproveFor(null);
      toast({
        message: "Ausencia aprobada",
        icon: <Icon name="status-success" size={16} />,
      });
    } else {
      toast({
        message: result.error ?? "No se pudo aprobar la ausencia",
        icon: <Icon name="status-error" size={16} />,
      });
    }
    refetch();
  };

  const handleReject = async (reason: string) => {
    if (!rejectFor) return;
    setRejectError(null);
    const result = await reject(rejectFor.id, reason);
    if (result.success) {
      setRejectFor(null);
      toast({
        message: "Ausencia rechazada",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
    } else if (result.error) {
      setRejectError(result.error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AbsencesHeader
        monthTitle={month?.monthTitle ?? monthLabel(monthKey)}
        onPreviousMonth={() => goToMonth(shiftMonth(monthKey, -1))}
        onNextMonth={() => goToMonth(shiftMonth(monthKey, 1))}
        onRegister={openRegister}
      />

      {loading && (
        <p className="text-body-sm text-neutral-subtle">Cargando ausencias…</p>
      )}

      {!loading && error && (
        <Alert
          variant="danger"
          title="No se pudieron cargar las ausencias"
          action={
            <Button variant="secondary" size="small" onClick={refetch}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!loading && !error && month && month.items.length === 0 && (
        <EmptyState
          icon={<Icon name="calendar" size={32} />}
          title={`Sin ausencias en ${month.monthTitle.toLowerCase()}`}
          description="Cuando registres vacaciones, permisos o incapacidades del chapter, este mes las va a mostrar con su impacto en capacidad."
          action={
            <Button variant="primary" onClick={openRegister}>
              Registrar ausencia
            </Button>
          }
        />
      )}

      {!loading && !error && month && month.items.length > 0 && (
        <>
          <AbsencesStatsCards
            month={month}
            chapterFte={overview?.chapterFte ?? null}
          />
          <AbsencesTable
            items={month.items}
            saving={saving}
            onApprove={(absence) => setApproveFor(absence)}
            onReject={(absence) => {
              setRejectError(null);
              setRejectFor(absence);
            }}
          />
          <Alert variant="info">
            La ausencia se registra una sola vez, acá. Al aprobarla, descuenta
            capacidad del mes. De este mismo registro saldrán el descuento en la
            factura del proveedor y el ajuste de capacidad de la célula y del
            sprint, que todavía no están disponibles.
          </Alert>
        </>
      )}

      {approveFor && (
        <ApproveAbsenceDialog
          absence={approveFor}
          open
          saving={saving}
          onOpenChange={(open) => {
            if (!open) setApproveFor(null);
          }}
          onConfirm={() => handleApprove(approveFor)}
        />
      )}

      <RegisterAbsenceDrawer
        key={registerKey}
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        people={(overview?.people ?? []).map((p) => ({
          id: p.id,
          name: p.name,
        }))}
        peopleLoading={peopleLoading}
        saving={saving}
        serverError={registerError}
        onSubmit={handleRegister}
      />
      {rejectFor && (
        <RejectAbsenceDrawer
          key={rejectFor.id}
          open={rejectFor !== null}
          onOpenChange={(open) => {
            if (!open) setRejectFor(null);
          }}
          absence={rejectFor}
          saving={saving}
          serverError={rejectError}
          onSubmit={handleReject}
        />
      )}
    </div>
  );
};
