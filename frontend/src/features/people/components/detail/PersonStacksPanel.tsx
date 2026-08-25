import React from "react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Link,
  SeniorityCard,
} from "@tuya-ui/components";
import { getPersonInitials } from "../../adapters/PersonAdapter";
import type { PersonDetail } from "../../adapters/PersonDetailAdapter";
import { DetailPanel, SECONDARY_TEXT } from "./DetailPanel";

export interface PersonStacksPanelProps {
  detail: PersonDetail;
  onEdit: () => void;
}

/**
 * Los stacks que domina la persona (RN-38): nivel en la escala Tuya, cuál es
 * el principal, quiénes más del chapter lo cubren y la marca de bus factor 1
 * cuando nadie más. Se edita en su propio drawer.
 */
export const PersonStacksPanel: React.FC<PersonStacksPanelProps> = ({
  detail,
  onEdit,
}) => (
  <DetailPanel
    title="Stacks"
    subtitle={
      detail.stacks.length > 0
        ? `${detail.stacks.length} · nivel por stack en la escala Tuya`
        : undefined
    }
    right={
      <Link
        href="#"
        tone="neutral"
        className="text-body-sm"
        onClick={(e) => {
          e.preventDefault();
          onEdit();
        }}
      >
        Editar
      </Link>
    }
    className="flex flex-col px-4 pb-2 pt-1"
  >
    {detail.stacks.length === 0 ? (
      <div className="flex flex-col items-start gap-2 py-4">
        <span className="text-body-sm font-medium text-neutral-default">
          Sin stacks registrados
        </span>
        <span className={SECONDARY_TEXT}>
          Sin esto, la persona no aparece al filtrar por stack ni cuenta en la
          cobertura del chapter.
        </span>
        <Button variant="secondary" size="small" onClick={onEdit}>
          Agregar stacks
        </Button>
      </div>
    ) : (
      <ul className="flex flex-col">
        {detail.stacks.map((s, index) => (
          <li
            key={s.name}
            className={`flex items-center gap-3 py-2.5 ${
              index > 0 ? "border-t border-neutral-default" : ""
            }`}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex items-center gap-2 text-body-sm font-medium text-neutral-default">
                {s.name}
                {s.isPrimary && <Badge variant="neutral">Principal</Badge>}
                {s.busFactorOne && <Badge variant="danger">Bus factor 1</Badge>}
              </span>
              {s.busFactorOne ? (
                <span className={`${SECONDARY_TEXT} text-danger-default`}>
                  Nadie más en el chapter lo cubre
                </span>
              ) : (
                <span className={`flex items-center gap-2 ${SECONDARY_TEXT}`}>
                  <AvatarGroup max={3}>
                    {s.coverers.map((c) => (
                      <Avatar
                        key={c.id}
                        size="small"
                        label={c.name}
                        colorId={c.id}
                      >
                        {getPersonInitials(c.name)}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  {s.otherCoverers === 1
                    ? "1 persona más lo cubre"
                    : `${s.otherCoverers} personas más lo cubren`}
                </span>
              )}
            </div>
            <SeniorityCard level={s.levelLabel} density="compact" />
          </li>
        ))}
      </ul>
    )}
  </DetailPanel>
);
