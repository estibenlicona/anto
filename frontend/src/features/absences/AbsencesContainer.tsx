import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, EmptyState, Icon, useToast } from "@tuya-ui/components";
import { useCapacityOverview } from "@features/control-tower/hooks/useCapacityOverview";
import { useLeadBreadcrumbActions } from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import {
  currentMonthKey,
  monthLabel,
  shiftMonth,
  type Absence,
} from "./adapters/AbsenceAdapter";
import { monthBounds } from "./services/businessDays";
import { useAbsencesMonth } from "./hooks/useAbsencesMonth";
import { useAbsencesFilters } from "./hooks/useAbsencesFilters";
import { useAbsenceMutations } from "./hooks/useAbsenceMutations";
import { AbsencesMonthNav } from "./components/AbsencesMonthNav";
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
  // Buscador, filtros y paginación trabajan sobre las filas ya cargadas del
  // mes: el endpoint devuelve el mes entero y no hay nada que volver a pedir.
  // Las cards siguen leyendo el mes completo, no lo filtrado.
  const filters = useAbsencesFilters(month?.items ?? [], monthKey);
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

  // Sin encabezado de módulo: el nombre de la pantalla ya lo da el breadcrumb
  // del shell, y el mes visible con su acción suben a esa misma franja, a la
  // derecha, para que el resumen y la tabla arranquen arriba. Tamaño small
  // porque la franja es una banda de navegación, no un encabezado.
  useLeadBreadcrumbActions(
    <div className="flex items-center gap-2">
      <AbsencesMonthNav
        monthTitle={month?.monthTitle ?? monthLabel(monthKey)}
        onPreviousMonth={() => goToMonth(shiftMonth(monthKey, -1))}
        onNextMonth={() => goToMonth(shiftMonth(monthKey, 1))}
      />
      <Button
        variant="primary"
        size="small"
        onClick={openRegister}
        iconBefore={<Icon name="calendar" size={16} />}
      >
        Registrar ausencia
      </Button>
    </div>
  );

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

  const monthIsEmpty =
    !loading && !error && month !== null && month.items.length === 0;

  return (
    <div className="flex flex-col gap-3">
      {monthIsEmpty ? (
        // Sin ninguna ausencia en el mes no hay nada que acotar: el estado
        // vacío reemplaza la tabla entera, barra incluida.
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
      ) : (
        <>
          {month && (
            <AbsencesStatsCards
              month={month}
              chapterFte={overview?.chapterFte ?? null}
            />
          )}
          <AbsencesTable
            items={filters.visible}
            loading={loading}
            error={error}
            onRetry={refetch}
            saving={saving}
            onApprove={(absence) => setApproveFor(absence)}
            onReject={(absence) => {
              setRejectError(null);
              setRejectFor(absence);
            }}
            page={filters.page}
            pageSize={filters.pageSize}
            total={filters.total}
            totalPages={filters.totalPages}
            onPageChange={filters.onPageChange}
            onPageSizeChange={filters.onPageSizeChange}
            search={filters.search}
            onSearchChange={filters.onSearchChange}
            selectedTypes={filters.types}
            onTypesChange={filters.onTypesChange}
            selectedStatuses={filters.statuses}
            onStatusesChange={filters.onStatusesChange}
          />
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
