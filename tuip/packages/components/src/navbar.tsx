import { Fragment, MouseEvent, ReactNode, useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/cn";
import { Avatar } from "./avatar";
import { Icon } from "./icon";
import { Menu, MenuItem, MenuSeparator } from "./menu";
import {
  NotificationMenu,
  NotificationMenuFooter,
  NotificationMenuHeader,
  NotificationMenuItem,
  type NotificationMenuItemVariant,
  NotificationMenuList,
} from "./notification-menu";

export interface NavbarAppRef {
  id: string;
  name: string;
  description?: string;
  /**
   * The app's own identity color for its switcher icon — consumer data, not
   * a system role. A set of apps needs to be told apart from each other by a
   * color each one owns, the same way a set of workspace icons would; a
   * semantic role (danger/warning/...) would incorrectly imply meaning here.
   */
  color: string;
  /** Marks the app the person is in right now. */
  current?: boolean;
  href?: string;
}

export interface NavbarNotification {
  id: string;
  label: ReactNode;
  detail?: ReactNode;
  timestamp: ReactNode;
  /** Defaults to `false` (read). */
  unread?: boolean;
  variant?: NotificationMenuItemVariant;
  onSelect?: () => void;
}

export interface NavbarUser {
  name: string;
  role?: string;
  /** Rendered inside the account avatar, e.g. "MR". */
  initials: string;
}

export interface NavbarUserMenuAction {
  label: ReactNode;
  /** Colors the action with the danger role and gets a separator before it, e.g. "Cerrar sesión". Place it last — Navbar inserts the separator for the first action marked this way, wherever it is. */
  destructive?: boolean;
  onSelect?: () => void;
}

export interface NavbarUtilityLink {
  label: ReactNode;
  href?: string;
  onSelect?: () => void;
}

export interface NavbarProps {
  /** The app's name, shown as text next to the brand mark — never an image. */
  product: string;
  /** The bar's color scheme. A per-product constant, independent of the page's own theme — never mixed within one product. Defaults to "dark". */
  variant?: "dark" | "light";
  /** Apps the person can switch to, shown in the brand mark's dropdown. An empty list (the default) makes the brand mark non-interactive — there is nothing to switch to. */
  apps?: NavbarAppRef[];
  /** Opens the app's own command palette. Without a handler, the search box isn't rendered at all. */
  onSearch?: () => void;
  /** Pending notifications. Only actionable events belong here — a merely informational event belongs in a history elsewhere. Defaults to `[]`. */
  notifications?: NavbarNotification[];
  /** Called when "Marcar leídas" is activated. Without a handler, that action isn't shown. */
  onMarkAllNotificationsRead?: () => void;
  /** Called when "Ver todas" is activated. Without a handler, that action isn't shown. */
  onViewAllNotifications?: () => void;
  /** The signed-in person: name, role and initials. */
  user: NavbarUser;
  /** Actions in the account panel below the name and role. Every product needs at least a way to sign out, so this has no default. */
  userMenu: NavbarUserMenuAction[];
  /** Utility links next to the search box, e.g. "Ayuda". Defaults to a single "Ayuda" link. Navbar doesn't enforce it, but the definition caps this at two. */
  utilities?: NavbarUtilityLink[];
  /** Intercepts link activation for the app's own router — called with the link's `href` instead of letting the browser navigate there. Without a handler, links use their plain `href`. */
  onNavigate?: (href: string) => void;
  /** Activates the compact variant's menu button, meant to toggle a separate side-menu component. Without a handler, that button isn't rendered — a dead toggle is worse than none. */
  onMenuToggle?: () => void;
  /** Additional classes merged onto the bar. */
  className?: string;
}

type NavbarPanel = "apps" | "notifications" | "account";

const defaultUtilities: NavbarUtilityLink[] = [{ label: "Ayuda" }];

/**
 * Shared by all three zones — `variant` is the one input that decides every
 * color role in the bar, so each zone derives the same tones from it rather
 * than each recomputing its own copy.
 */
function getNavbarTone(variant: "dark" | "light") {
  const dark = variant === "dark";
  const interactive = cn(
    "rounded-control outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
    // Opacity modifiers (`bg-x/10`) produce no rule at all for these tokens —
    // each is a plain `var(--color-...)` reference, not the space-separated
    // channel form Tailwind's opacity support needs. `bg-neutral-bold`
    // (neutral.800, #26262C) sits one step lighter than the dark bar's own
    // background (neutral.900) and doubles as the mockup's own hover/search
    // surface color in dark mode, so it substitutes cleanly with no opacity
    // trick required.
    dark
      ? "hover:bg-neutral-bold data-[state=open]:bg-neutral-bold"
      : "hover:bg-neutral-subtle-hover data-[state=open]:bg-neutral-subtle-hover",
  );
  const titleText = dark ? "text-neutral-inverse" : "text-neutral-default";
  // No semantic text/icon role reads legibly against the dark bar besides
  // "inverse" (every other neutral text step is dark-toned, meant for a
  // light page) — so unlike the mockup's separate dimmer "muted" tone, dark
  // mode uses the same full-strength color for both title and secondary
  // text. Documented in design.md as a real, visible simplification.
  const mutedText = dark ? "text-neutral-inverse" : "text-neutral-subtle";
  return { dark, interactive, titleText, mutedText };
}

function navigateProps(
  href: string | undefined,
  onSelect: (() => void) | undefined,
  onNavigate: ((href: string) => void) | undefined,
) {
  return {
    href: href ?? "#",
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      if (href && onNavigate) {
        event.preventDefault();
        onNavigate(href);
      } else if (!href) {
        event.preventDefault();
      }
      onSelect?.();
    },
  };
}

/**
 * The one bar every internal app shares — brand and app switcher on the
 * left, search at the center, utilities/notifications/account on the
 * right. Its three anchored panels (apps, notifications, account) share a
 * single open slot: at most one is ever open, each one's `Menu`/
 * `NotificationMenu` controlled via the `open`/`onOpenChange` added to
 * both for this. Switching directly between two open panels takes two
 * activations, not one — see the note on `panelProps` for why.
 *
 * `variant` is not the app's own light/dark theme — the design defines it as
 * a fixed choice per product, so it always resolves through the same
 * (light-mode) token palette rather than following `data-theme`. Where no
 * token gives a dimmer-but-legible tone on the dark surface, the nearest
 * existing neutral step stands in instead (`bg-neutral-bold`, one step
 * lighter than the bar itself) — never a hardcoded color outside the token
 * set. Opacity modifiers (`bg-x/10`) were tried first but produce no rule
 * at all for these CSS-variable-backed tokens.
 */
export function Navbar({
  product,
  variant = "dark",
  apps = [],
  onSearch,
  notifications = [],
  onMarkAllNotificationsRead,
  onViewAllNotifications,
  user,
  userMenu,
  utilities = defaultUtilities,
  onNavigate,
  onMenuToggle,
  className,
}: NavbarProps) {
  const [openPanel, setOpenPanel] = useState<NavbarPanel | null>(null);
  const narrow = useNarrowViewport();
  const { dark } = getNavbarTone(variant);

  /**
   * Each panel is its own `DropdownMenu.Root`, so at most one is ever open
   * purely from Radix's own outside-click dismissal: opening any trigger's
   * panel is itself an outside click on whichever other one was open, and
   * closes it independently of anything here. What Radix does not do is
   * open the *new* one in that same click — verified directly (a clean,
   * single click on a second trigger while the first is open leaves both
   * closed, confirmed across several independent coordination attempts
   * documented in tasks.md) — so switching directly from one panel to
   * another takes two activations: the first closes the current one, the
   * second opens the intended one. That is a real, documented limitation
   * of composing several independent Radix roots this way, not a gap this
   * component is expected to paper over with custom event interception
   * that fights Radix's own dismiss layer.
   */
  function panelProps(panel: NavbarPanel) {
    return {
      open: openPanel === panel,
      onOpenChange: (open: boolean) => setOpenPanel(open ? panel : null),
    };
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-navigation flex h-12 min-[960px]:h-14 items-center gap-4 px-5",
        dark ? "bg-neutral-inverse" : "border-b-default border-neutral-default bg-neutral-default",
        className,
      )}
    >
      <a
        href="#main-content"
        className={cn(
          "sr-only focus:not-sr-only focus:absolute focus:left-5 focus:top-2 focus:z-menu focus:rounded-control focus:px-3 focus:py-1.5 focus:text-body-sm focus:font-medium",
          "focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
          dark ? "focus:bg-neutral-default focus:text-neutral-default" : "focus:bg-neutral-inverse focus:text-neutral-inverse",
        )}
      >
        Saltar al contenido
      </a>

      <nav className="flex min-w-0 flex-1 items-center gap-4">
        <NavbarBrand product={product} variant={variant} apps={apps} onNavigate={onNavigate} {...panelProps("apps")} />

        <span aria-hidden="true" className={cn("h-5 w-px shrink-0", dark ? "bg-neutral-bold" : "bg-neutral-subtle-pressed")} />

        <NavbarSearch onSearch={onSearch} variant={variant} />
      </nav>

      <NavbarUtilities
        utilities={utilities}
        notifications={notifications}
        user={user}
        userMenu={userMenu}
        variant={variant}
        narrow={narrow}
        onNavigate={onNavigate}
        onMarkAllNotificationsRead={onMarkAllNotificationsRead}
        onViewAllNotifications={onViewAllNotifications}
        onMenuToggle={onMenuToggle}
        notificationsOpen={panelProps("notifications").open}
        onNotificationsOpenChange={panelProps("notifications").onOpenChange}
        accountOpen={panelProps("account").open}
        onAccountOpenChange={panelProps("account").onOpenChange}
      />
    </header>
  );
}

Navbar.displayName = "Navbar";

export interface NavbarBrandProps {
  /** The app's name, shown as text next to the brand mark — never an image. */
  product: string;
  /** The bar's color scheme. Defaults to "dark". */
  variant?: "dark" | "light";
  /** Apps the person can switch to. An empty list (the default) makes the brand mark non-interactive. */
  apps?: NavbarAppRef[];
  /** Intercepts link activation for the app's own router. */
  onNavigate?: (href: string) => void;
  /** Whether the app-switcher panel is open. */
  open?: boolean;
  /** Called when the app-switcher panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * La cabecera de AppShell copia esta anatomía (cuadro 24px bg-brand-bold +
 * producto body-sm semibold) en vez de reutilizar el componente: necesita un
 * modo sólo-cuadro al colapsar que esta pieza no tiene suelta. Si la forma
 * de la marca cambia acá, cambia también en app-shell.tsx.
 */
export function NavbarBrand({ product, variant = "dark", apps = [], onNavigate, open, onOpenChange }: NavbarBrandProps) {
  const { titleText, mutedText, interactive } = getNavbarTone(variant);

  if (apps.length === 0) {
    return (
      <span className="flex shrink-0 items-center gap-2.5 py-1.5 pl-1 pr-2">
        <span aria-hidden="true" className="h-6 w-6 shrink-0 rounded-control bg-brand-bold" />
        <span className={cn("text-body-sm font-semibold", titleText)}>{product}</span>
      </span>
    );
  }

  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button type="button" className={cn("flex shrink-0 items-center gap-2.5 py-1.5 pl-1 pr-2", interactive)}>
          <span aria-hidden="true" className="h-6 w-6 shrink-0 rounded-control bg-brand-bold" />
          <span className={cn("text-body-sm font-semibold", titleText)}>{product}</span>
          <Icon name="chevron-down" size={16} className={mutedText} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="bottom"
          align="start"
          sideOffset={4}
          className="z-menu flex w-[300px] flex-col overflow-hidden rounded-control border-default border-neutral-default bg-neutral-default py-1 shadow-md"
        >
          <div className="px-4 pb-1.5 pt-2 text-label uppercase text-neutral-subtlest">Aplicaciones internas</div>
          {apps.map((app) => (
            <DropdownMenu.Item key={app.id} asChild className="outline-none">
              <a
                {...navigateProps(app.href, undefined, onNavigate)}
                className="flex cursor-pointer items-center gap-3 px-4 py-2.5 data-[highlighted]:bg-neutral-subtle"
              >
                <span
                  aria-hidden="true"
                  className="h-6 w-6 shrink-0 rounded-control"
                  style={{ backgroundColor: app.color }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-sm font-medium text-neutral-default">{app.name}</span>
                  {app.description && (
                    <span className="block truncate text-body-sm text-neutral-subtle">{app.description}</span>
                  )}
                </span>
                {app.current && <span className="shrink-0 text-body-sm font-medium text-brand-default">actual</span>}
              </a>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

NavbarBrand.displayName = "NavbarBrand";

export interface NavbarSearchProps {
  /** Opens the app's own command palette. Without a handler, nothing is rendered. */
  onSearch?: () => void;
  /** The bar's color scheme. Defaults to "dark". */
  variant?: "dark" | "light";
}

export function NavbarSearch({ onSearch, variant = "dark" }: NavbarSearchProps) {
  const { dark, mutedText } = getNavbarTone(variant);

  if (!onSearch) return null;

  return (
    <button
      type="button"
      onClick={onSearch}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-control text-body-sm",
        "min-[1120px]:w-[240px] min-[1120px]:justify-start min-[1120px]:px-3 min-[1440px]:w-[380px]",
        mutedText,
        dark ? "bg-neutral-bold hover:bg-neutral-strong" : "border-default border-neutral-default bg-neutral-subtlest hover:bg-neutral-subtle-hover",
      )}
    >
      <Icon name="search" size={16} className="shrink-0" />
      <span className="hidden truncate min-[1120px]:inline">Buscar</span>
      <span
        className={cn(
          "ml-auto hidden shrink-0 rounded-control border-default px-1 text-body-sm min-[1120px]:inline",
          dark ? "border-neutral-bold" : "border-neutral-default",
        )}
      >
        ⌘K
      </span>
    </button>
  );
}

NavbarSearch.displayName = "NavbarSearch";

export interface NavbarUtilitiesProps {
  /** Utility links next to the search box, e.g. "Ayuda". */
  utilities: NavbarUtilityLink[];
  /** Pending notifications. Defaults to `[]`. */
  notifications?: NavbarNotification[];
  /** The signed-in person. */
  user: NavbarUser;
  /** Actions in the account panel. */
  userMenu: NavbarUserMenuAction[];
  /** The bar's color scheme. Defaults to "dark". */
  variant?: "dark" | "light";
  /** Below 1120px, utility links relocate into the account panel instead of the bar. */
  narrow?: boolean;
  /** Intercepts link activation for the app's own router. */
  onNavigate?: (href: string) => void;
  /** Called when "Marcar leídas" is activated. */
  onMarkAllNotificationsRead?: () => void;
  /** Called when "Ver todas" is activated. */
  onViewAllNotifications?: () => void;
  /** Activates the compact variant's menu button. */
  onMenuToggle?: () => void;
  /** Whether the notifications panel is open. */
  notificationsOpen?: boolean;
  /** Called when the notifications panel opens or closes. */
  onNotificationsOpenChange?: (open: boolean) => void;
  /** Whether the account panel is open. */
  accountOpen?: boolean;
  /** Called when the account panel opens or closes. */
  onAccountOpenChange?: (open: boolean) => void;
}

export function NavbarUtilities({
  utilities,
  notifications = [],
  user,
  userMenu,
  variant = "dark",
  narrow = false,
  onNavigate,
  onMarkAllNotificationsRead,
  onViewAllNotifications,
  onMenuToggle,
  notificationsOpen,
  onNotificationsOpenChange,
  accountOpen,
  onAccountOpenChange,
}: NavbarUtilitiesProps) {
  const { titleText, mutedText, interactive } = getNavbarTone(variant);
  const hasUnread = notifications.some((item) => item.unread);
  const firstDestructiveIndex = userMenu.findIndex((action) => action.destructive);

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {!narrow &&
        utilities.map((link, index) => (
          <a
            key={index}
            {...navigateProps(link.href, link.onSelect, onNavigate)}
            className={cn("hidden h-8 items-center px-3 text-body-sm min-[1120px]:flex", mutedText, interactive)}
          >
            {link.label}
          </a>
        ))}

      <NotificationMenu
        open={notificationsOpen}
        onOpenChange={onNotificationsOpenChange}
        trigger={
          <button
            type="button"
            aria-label={hasUnread ? "Notificaciones, hay notificaciones sin leer" : "Notificaciones"}
            className={cn("relative flex h-8 w-8 items-center justify-center", mutedText, interactive)}
          >
            <Icon name="notification" size={20} />
            {hasUnread && <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-2 w-2 rounded-pill bg-brand-bold" />}
          </button>
        }
      >
        <NotificationMenuHeader
          title="Notificaciones"
          action={onMarkAllNotificationsRead ? "Marcar leídas" : undefined}
          onActionSelect={onMarkAllNotificationsRead}
        />
        <NotificationMenuList>
          {notifications.map((item) => (
            <NotificationMenuItem
              key={item.id}
              unread={item.unread}
              label={item.label}
              detail={item.detail}
              timestamp={item.timestamp}
              variant={item.variant}
              onSelect={item.onSelect}
            />
          ))}
        </NotificationMenuList>
        {onViewAllNotifications && (
          <NotificationMenuFooter onSelect={onViewAllNotifications}>Ver todas</NotificationMenuFooter>
        )}
      </NotificationMenu>

      <Menu
        open={accountOpen}
        onOpenChange={onAccountOpenChange}
        align="end"
        trigger={
          <button type="button" className={cn("flex h-9 items-center gap-2 py-0.5 pl-0.5 pr-2", interactive)}>
            <Avatar size="medium" label={user.name}>
              {user.initials}
            </Avatar>
            <span className={cn("hidden text-body-sm min-[1120px]:inline", titleText)}>{user.name}</span>
          </button>
        }
      >
        <div className="border-b-default border-neutral-default px-3 py-2.5">
          <div className="text-body-sm font-semibold text-neutral-default">{user.name}</div>
          {user.role && <div className="text-body-sm text-neutral-subtle">{user.role}</div>}
        </div>
        {narrow &&
          utilities.map((link, index) => (
            <MenuItem
              key={`utility-${index}`}
              onSelect={() => {
                if (link.href && onNavigate) onNavigate(link.href);
                link.onSelect?.();
              }}
            >
              {link.label}
            </MenuItem>
          ))}
        {userMenu.map((action, index) => (
          <Fragment key={index}>
            {index === firstDestructiveIndex && <MenuSeparator />}
            <MenuItem destructive={action.destructive} onSelect={action.onSelect}>
              {action.label}
            </MenuItem>
          </Fragment>
        ))}
      </Menu>

      {onMenuToggle && (
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={onMenuToggle}
          className={cn("flex h-8 w-8 items-center justify-center min-[960px]:hidden", mutedText, interactive)}
        >
          <Icon name="menu" size={20} />
        </button>
      )}
    </div>
  );
}

NavbarUtilities.displayName = "NavbarUtilities";

/**
 * Below 1120px "Ayuda" (and any other utility link) moves into the account
 * panel instead of just disappearing — a real relocation, not a CSS hide, so
 * it stays reachable. That relocation is a structural difference (which
 * parent an element renders under), which a media query alone can't express;
 * a resize listener is the plainest way to know which parent to render it
 * under.
 */
function useNarrowViewport(): boolean {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1119px)");
    const onChange = () => setNarrow(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return narrow;
}

