import React from "react";
import { Button, LevelMeter, Link } from "@tuya-ui/components";
import type { PersonDetail } from "../../adapters/PersonDetailAdapter";
import { DetailPanel, SECONDARY_TEXT } from "./DetailPanel";

export interface PersonStacksPanelProps {
  detail: PersonDetail;
  onEdit: () => void;
}

// El mismo orden tonal del resto del sistema: sky → blue → violet → magenta.
const TONES = ["sky", "blue", "violet", "magenta"] as const;

/** Las mismas cinco filas que Perfil evaluado: los dos paneles truncan igual. */
export const SHOWN_ROWS = 5;

/**
 * Los stacks de la persona, cada uno con el medidor de nivel del sistema de
 * diseño y nada más: el nombre del nivel lo lleva el `label` accesible del
 * medidor, no un texto al lado. La cobertura del chapter y el bus factor se
 * leen en el mapa del span de Competencias, no acá.
 */
export const PersonStacksPanel: React.FC<PersonStacksPanelProps> = ({
  detail,
  onEdit,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const shown = expanded ? detail.stacks : detail.stacks.slice(0, SHOWN_ROWS);
  const hidden = detail.stacks.length - SHOWN_ROWS;
  return (
    <DetailPanel
      title="Stacks"
      subtitle={
        detail.stacks.length > 0 ? `${detail.stacks.length}` : undefined
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
        <>
          <ul className="flex flex-col">
            {shown.map((s, index) => (
              <li
                key={s.name}
                className={`flex items-center justify-between gap-4 py-2.5 ${
                  index === shown.length - 1 && hidden <= 0
                    ? ""
                    : "border-b border-neutral-default"
                }`}
              >
                <span className="text-body-sm font-medium text-neutral-default">
                  {s.name}
                </span>
                <span className="block w-24 shrink-0">
                  <LevelMeter
                    value={s.level}
                    tone={TONES[s.level - 1] ?? "magenta"}
                    label={`${s.name}: ${s.levelLabel}`}
                  />
                </span>
              </li>
            ))}
          </ul>
          {hidden > 0 && (
            <Button
              variant="subtle"
              size="small"
              className="my-1 self-start"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? "Ver menos" : `Ver ${hidden} más`}
            </Button>
          )}
        </>
      )}
    </DetailPanel>
  );
};
