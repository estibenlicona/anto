import React, { useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Icon,
  Input,
  Tag,
} from "@tuya-ui/components";
import { useDevOpsUserSearch } from "../../hooks/useDevOpsUserSearch";
import type { DevOpsUserDto } from "../../services/personDetailService";
import { canLink, hasEmailShape, initialsOf } from "./linkDevOpsIdentityRules";

export interface LinkDevOpsIdentityDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  /** El correo corporativo de la persona: con él arranca la búsqueda. */
  personEmail: string;
  linking: boolean;
  serverError: string | null;
  /** Recibe el identificador del usuario de Azure DevOps encontrado. */
  onConfirm: (devOpsUserId: string) => void;
}

/**
 * Vincular a una persona con su usuario de Azure DevOps buscándolo por
 * correo. Drawer y no Modal, como el resto de lo que se edita desde el
 * detalle: el resultado trae tres listas de etiquetas que pueden crecer, y el
 * Modal de tuip no encoge su cuerpo para scrollear (ver PersonFormDrawer).
 *
 * La búsqueda vive en `useDevOpsUserSearch` y las reglas en
 * `linkDevOpsIdentityRules`; acá sólo se decide qué mostrar en cada estado.
 */
export const LinkDevOpsIdentityDrawer: React.FC<
  LinkDevOpsIdentityDrawerProps
> = ({
  open,
  onOpenChange,
  personName,
  personEmail,
  linking,
  serverError,
  onConfirm,
}) => {
  const search = useDevOpsUserSearch();
  const [email, setEmail] = useState(personEmail);
  const [emailError, setEmailError] = useState<string | null>(null);

  const searching = search.status === "searching";
  const linkable = canLink(search, email);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!hasEmailShape(value)) {
      setEmailError("Escribe un correo con forma de correo");
      return;
    }
    setEmailError(null);
    void search.search(value);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(null);
    // El resultado era de otro correo: mostrarlo junto al texto nuevo invita
    // a vincular algo distinto de lo que se está mirando.
    if (search.status !== "idle") search.reset();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} size="sm">
      <DrawerHeader eyebrow={personName} title="Vincular con Azure DevOps">
        <p className="mt-1 text-body-sm text-neutral-subtle">
          Una identidad sólo puede vincularse a una persona.
        </p>
      </DrawerHeader>
      <DrawerBody className="flex flex-col gap-4">
        <form className="flex flex-col gap-1" onSubmit={handleSearch}>
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Input
                label="Correo corporativo"
                required
                value={email}
                error={emailError ?? undefined}
                onChange={(e) => handleEmailChange(e.target.value)}
              />
            </div>
            {/* El campo pone su error debajo de sí mismo y el botón queda
                alineado con la caja del campo, no con el mensaje. */}
            <div className={emailError ? "self-start pt-[26px]" : undefined}>
              <Button
                type="submit"
                variant="secondary"
                isLoading={searching}
                iconBefore={<Icon name="search" size={16} />}
              >
                {searching ? "Buscando…" : "Buscar"}
              </Button>
            </div>
          </div>
        </form>

        {search.status === "found" && search.user && (
          <FoundUser user={search.user} />
        )}

        {search.status === "notFound" && (
          <Alert variant="warning" title="Sin coincidencia en Azure DevOps">
            Ningún usuario tiene el correo{" "}
            <span className="font-mono text-[13px]">
              {search.searchedEmail}
            </span>
            . Revisa el correo y vuelve a buscar.
          </Alert>
        )}

        {search.status === "error" && (
          <Alert
            variant="danger"
            title="No se pudo consultar Azure DevOps"
            action={
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  if (search.searchedEmail)
                    void search.search(search.searchedEmail);
                }}
              >
                Reintentar
              </Button>
            }
          >
            {search.error}
          </Alert>
        )}

        {serverError && (
          <p className="text-body-sm text-danger-default">{serverError}</p>
        )}
      </DrawerBody>
      <DrawerFooter className="justify-end">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          disabled={!linkable || linking}
          iconBefore={<Icon name="link" size={16} />}
          onClick={() => {
            if (search.user) onConfirm(search.user.id);
          }}
        >
          {linking ? "Vinculando…" : "Vincular"}
        </Button>
      </DrawerFooter>
    </Drawer>
  );
};

const FoundUser: React.FC<{ user: DevOpsUserDto }> = ({ user }) => {
  // DevOps puede devolver una URL que exija sesión: si la imagen no carga, las
  // iniciales ocupan su lugar en vez de dejar un cuadro roto.
  const [avatarFailed, setAvatarFailed] = useState(false);
  const showImage = Boolean(user.avatarUrl) && !avatarFailed;
  return (
    <section
      aria-label="Usuario encontrado"
      className="flex flex-col gap-3 border-t-default border-neutral-default pt-4"
    >
      <div className="flex items-center gap-3">
        {showImage ? (
          <img
            src={user.avatarUrl ?? undefined}
            alt=""
            className="h-10 w-10 shrink-0 rounded-pill object-cover"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <Avatar size="large" label={user.displayName} colorId={user.id}>
            {initialsOf(user.displayName)}
          </Avatar>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-body-sm font-semibold text-neutral-default">
            {user.displayName}
          </span>
          <span className="text-body-sm text-neutral-subtle">{user.email}</span>
          <span className="font-mono text-label font-normal tracking-normal text-neutral-subtlest">
            {user.id}
          </span>
        </div>
        <Badge variant="success">Coincide</Badge>
      </div>
      <dl className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-x-3 gap-y-2">
        <UserGroup label="Proyectos" items={user.projects} />
        <UserGroup label="Equipos" items={user.teams} />
        <UserGroup label="Tableros" items={user.boards} />
      </dl>
    </section>
  );
};

const UserGroup: React.FC<{ label: string; items: string[] }> = ({
  label,
  items,
}) => (
  <>
    <dt className="text-label text-neutral-subtle">{label}</dt>
    <dd className="flex flex-wrap gap-1.5">
      {items.length === 0 ? (
        <span className="text-body-sm text-neutral-subtle">Ninguno</span>
      ) : (
        items.map((item) => <Tag key={item}>{item}</Tag>)
      )}
    </dd>
  </>
);
