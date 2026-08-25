import { Link, useLocation } from "react-router";
import { findPosition, type NavItem } from "../data/navigation";

const SIDE_CLASSES =
  "flex-1 rounded-control border border-neutral-default px-[18px] py-4 text-body-sm";

function Side({
  item,
  direction,
}: {
  item: NavItem | undefined;
  direction: "previous" | "next";
}) {
  const label = direction === "previous" ? "Anterior" : "Siguiente";
  const alignment = direction === "next" ? "text-right" : "";

  // An end of the order has nowhere to go, so it is shown as unavailable
  // rather than linking somewhere the reader did not ask for.
  if (!item) {
    return (
      <div aria-disabled className={`${SIDE_CLASSES} ${alignment} opacity-50`}>
        <span className="block text-body-sm text-neutral-subtle">{label}</span>
        <span className="mt-1 block font-medium text-neutral-subtle">—</span>
      </div>
    );
  }

  return (
    <Link
      to={item.to}
      className={`${SIDE_CLASSES} ${alignment} hover:border-neutral-bold hover:bg-neutral-subtle`}
    >
      <span className="block text-body-sm text-neutral-subtle">{label}</span>
      <span className="mt-1 block font-medium text-neutral-default">
        {item.label}
      </span>
    </Link>
  );
}

/**
 * Walks the flattened navigation, so a page added to the sidebar joins the
 * sequence without anyone maintaining a second ordering.
 */
export function Pager() {
  const { pathname } = useLocation();
  const position = findPosition(pathname);
  if (!position) return null;

  return (
    <nav
      aria-label="Páginas contiguas"
      className="mt-[72px] flex gap-4 border-t border-neutral-default pt-6"
    >
      <Side item={position.previous} direction="previous" />
      <Side item={position.next} direction="next" />
    </nav>
  );
}
