import React, { useState } from "react";
import {
  Avatar,
  Button,
  Chip,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Select,
  Textarea,
} from "@tuya-ui/components";
import { FormSection } from "@shared/components/FormSection";
import type { BacklogStory } from "../adapters/BacklogAdapter";
import type {
  BacklogCatalogsDto,
  RejectReason,
  RejectRequest,
} from "../services/backlogService";

export interface RejectCandidate {
  id: string;
  name: string;
}

export interface RejectItemDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story: BacklogStory;
  catalogs: BacklogCatalogsDto | null;
  /** Personas del chapter con identidad DevOps, para "¿de quién es, entonces?". */
  candidates: RejectCandidate[];
  saving: boolean;
  serverError: string | null;
  onSubmit: (request: RejectRequest) => void;
}

/**
 * "No es de <nombre>": motivo obligatorio (RN-53), la persona correcta
 * opcional, y el efecto a la vista. DevOps no se toca (RN-47).
 */
export const RejectItemDrawer: React.FC<RejectItemDrawerProps> = ({
  open,
  onOpenChange,
  story,
  catalogs,
  candidates,
  saving,
  serverError,
  onSubmit,
}) => {
  const [reason, setReason] = useState<RejectReason | "">("");
  const [personId, setPersonId] = useState<string>("");
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const firstName = story.personName?.split(" ")[0] ?? "";
  const reasonError =
    submitted && reason === "" ? "Selecciona el motivo" : undefined;
  const target = candidates.find((c) => c.id === personId);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (reason === "") return;
    onSubmit({
      reason,
      reassignToPersonId: personId || undefined,
      detail: detail.trim() || undefined,
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} size="lg">
      <form className="flex h-full flex-col" onSubmit={handleSubmit}>
        <DrawerHeader title={`Rechazar: no es de ${firstName}`}>
          <p className="mt-1 text-body-sm text-neutral-subtle">
            El item deja de contar en su FTE real y en el board. El motivo queda
            trazado.
          </p>
        </DrawerHeader>
        <DrawerBody>
          <FormSection icon="work-item" title="El item" first>
            <div className="flex flex-col gap-1 rounded-control bg-neutral-subtle px-3.5 py-3">
              <span className="flex items-center gap-2 text-body-sm font-medium text-neutral-default">
                <span className="font-mono text-neutral-subtle">
                  #{story.number}
                </span>
                {story.title}
              </span>
              <span className="text-label font-normal tracking-normal text-neutral-subtle">
                Historia de usuario · {story.points} pts · {story.board}
                {story.outcomeLabel ? ` · ${story.outcomeLabel}` : ""}
              </span>
              <span className="text-label font-normal tracking-normal text-neutral-subtle">
                Asignado en DevOps a{" "}
                <b className="font-medium text-neutral-default">
                  {story.personName}
                </b>
                {story.changedAssignee
                  ? ` · antes ${story.previousAssignedTo}`
                  : ""}
              </span>
            </div>
          </FormSection>

          <FormSection icon="edit" title="Motivo">
            <div className="flex flex-col gap-3">
              <div
                role="group"
                aria-label="Motivo"
                className="flex flex-wrap gap-1.5"
              >
                {(catalogs?.rejectReasons ?? []).map((r) => (
                  <Chip
                    key={r.value}
                    selectable
                    selected={reason === r.value}
                    onSelectedChange={(on) => setReason(on ? r.value : "")}
                  >
                    {r.label}
                  </Chip>
                ))}
              </div>
              {reasonError && (
                <span role="alert" className="text-body-sm text-danger-default">
                  {reasonError}
                </span>
              )}
              <Select
                label="¿De quién es, entonces?"
                options={candidates.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                value={personId || undefined}
                onValueChange={setPersonId}
                placeholder="Opcional"
                hint="Si lo indicas, el item entra a la cola de esa persona. DevOps no se toca: la integración es sólo lectura."
              />
              <Textarea
                label="Detalle"
                rows={3}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Qué pasó, para quien lo lea después"
              />
            </div>
          </FormSection>

          <FormSection icon="status-success" title="Así queda">
            <div className="flex flex-col gap-2 rounded-control border border-neutral-default px-3.5 py-3 text-body-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2">
                  <Avatar
                    size="small"
                    label={story.personName ?? ""}
                    colorId={story.personId ?? story.id}
                  >
                    {story.initials}
                  </Avatar>
                  {story.personName}
                </span>
                <span className="text-label font-normal tracking-normal text-neutral-subtle">
                  deja de contar esta historia
                </span>
              </div>
              {target && (
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2">
                    <Avatar
                      size="small"
                      label={target.name}
                      colorId={target.id}
                    >
                      {target.name
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")}
                    </Avatar>
                    {target.name}
                  </span>
                  <span className="text-label font-normal tracking-normal text-neutral-subtle">
                    entra a su cola{" "}
                    <b className="text-warning-default">por clasificar</b>
                  </span>
                </div>
              )}
            </div>
          </FormSection>

          {serverError && (
            <p role="alert" className="text-body-sm text-danger-default">
              {serverError}
            </p>
          )}
        </DrawerBody>
        <DrawerFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={saving}>
            Rechazar
          </Button>
        </DrawerFooter>
      </form>
    </Drawer>
  );
};
