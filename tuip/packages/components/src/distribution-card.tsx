import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card, CardBody } from "./card";
import { SegmentedBar, segmentFillClass, type SegmentedBarSegment } from "./progress";

/** One slice of the distribution: a label, a count and exactly one of SegmentedBar's colour vocabularies. */
export type DistributionItem = SegmentedBarSegment & { label: string };

export interface DistributionCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Uppercase rubric of the card. */
  title: string;
  /**
   * Total shown in the header's right slot, next to `totalNoun`. Omit when the
   * card leads with a `headline` instead: the figure the reader needs is then
   * the headline, and a second total in the corner would compete with it.
   */
  total?: number;
  /** Noun after the total — "células", "personas". */
  totalNoun?: string;
  /**
   * A figure to lead with — the one reading of the distribution that matters
   * ("61%", "2") — with a note beside it that says what it is of ("11 de 18
   * en avanzado o superior"). Sits between the rubric and the bar, in the
   * same type the other summary cards use for their metric.
   */
  headline?: { value: ReactNode; note?: ReactNode };
  /**
   * Where to go for the full picture: a neutral Link in the header's right
   * slot, in place of the total. The link text should name the destination
   * ("Ver células"), never the card.
   */
  action?: ReactNode;
  items: DistributionItem[];
  /** Draw the segments as separate pieces. Defaults to true: a distribution is categories, not one continuum. */
  separated?: boolean;
  /** A reading derived from the same figures, pinned to the bottom behind a rule. */
  footer?: ReactNode;
  /**
   * How the legend lays out. `grid` (default) is two columns, for many short
   * categories. `list` is one row per item with a rule between rows and the
   * count flush right: for few items, where two columns would leave the counts
   * floating far from their labels. `inline` is one wrapping row of
   * "dot label count" chips under the bar, for when the legend is a caption
   * and the figure above it carries the card.
   */
  legend?: "grid" | "list" | "inline";
}

/**
 * The summary card for a distribution: a rubric, the total, a SegmentedBar,
 * a two-column legend whose dots wear the very same fill class as the
 * segments, and an optional footer for the one reading the legend does not
 * give at a glance. Items with a count of 0 stay in the legend but draw no
 * segment — a zero-width piece with a gap would leave a hole.
 */
export function DistributionCard({
  title,
  total,
  totalNoun,
  items,
  separated = true,
  footer,
  legend = "grid",
  headline,
  action,
  className,
  ...props
}: DistributionCardProps) {
  return (
    <Card className={className} {...props}>
      <CardBody className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-label text-neutral-subtle">{title}</span>
          {action !== undefined ? (
            <span className="text-body-sm">{action}</span>
          ) : total !== undefined ? (
            <span className="text-body-sm text-neutral-subtle">
              <span className="font-bold tabular-nums text-neutral-default">{total}</span>{" "}
              {totalNoun}
            </span>
          ) : null}
        </div>
        {headline !== undefined && (
          <div className="flex items-baseline gap-2">
            <span className="text-metric tabular-nums text-neutral-default">{headline.value}</span>
            {headline.note !== undefined && (
              <span className="text-body-sm text-neutral-subtle">{headline.note}</span>
            )}
          </div>
        )}
        <SegmentedBar separated={separated} segments={items.filter((item) => item.value > 0)} />
        <ul
          className={cn(
            legend === "grid" && "grid grid-cols-2 gap-x-4 gap-y-2",
            legend === "list" && "flex flex-col divide-y-default divide-neutral-default",
            legend === "inline" && "flex flex-wrap gap-x-3.5 gap-y-1",
          )}
        >
          {items.map((item) => (
            <li
              key={item.label}
              className={cn(
                "flex items-center gap-2 text-body-sm",
                legend === "list" && "py-1.5",
                legend === "inline" && "gap-1.5 text-label font-normal tracking-normal",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "h-2 w-2 shrink-0 rounded-pill",
                  segmentFillClass(item),
                  // The lightest heat step is the border grey: give the dot an
                  // edge so it does not vanish against the card.
                  item.heat === "low" && "border-default border-neutral-bold",
                )}
              />
              <span className={cn("truncate text-neutral-subtle", legend !== "inline" && "flex-1")}>
                {item.label}
              </span>
              <span className="font-bold tabular-nums text-neutral-default">{item.value}</span>
            </li>
          ))}
        </ul>
        {footer !== undefined && (
          <div className="mt-auto border-t-default border-neutral-default pt-2 text-body-sm text-neutral-subtle">
            {footer}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
