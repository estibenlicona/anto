import type { ComponentContent } from "./types";
import { buttonContent } from "./button";
import { inputContent } from "./input";
import { searchFieldContent } from "./search-field";
import { cardContent } from "./card";
import { badgeContent } from "./badge";
import { tagContent } from "./tag";
import { selectContent } from "./select";
import { comboboxContent } from "./combobox";
import { checkboxContent } from "./checkbox";
import { radioGroupContent } from "./radio-group";
import { switchContent } from "./switch";
import { tableContent } from "./table";
import { paginationContent } from "./pagination";
import { paginationBarContent } from "./pagination-bar";
import { chipContent } from "./chip";
import { segmentedControlContent } from "./segmented-control";
import { sliderContent } from "./slider";
import { tabsContent } from "./tabs";
import { accordionContent } from "./accordion";
import { popoverContent } from "./popover";
import { filterButtonContent } from "./filter-button";
import { commandPaletteContent } from "./command-palette";
import { alertContent } from "./alert";
import { avatarContent } from "./avatar";
import { progressContent } from "./progress";
import { levelMeterContent } from "./level-meter";
import { seniorityCardContent } from "./seniority-card";
import { breadcrumbContent } from "./breadcrumb";
import { linkContent } from "./link";
import { meterContent } from "./meter";
import { sparklineContent } from "./sparkline";
import { kbdContent } from "./kbd";
import { textareaContent } from "./textarea";
import { optionCardContent } from "./option-card";
import { capacityBarContent } from "./capacity-bar";
import { distributionCardContent } from "./distribution-card";
import { dateFieldContent } from "./date-field";
import { dateRangeFieldContent } from "./date-range-field";
import { emptyStateContent } from "./empty-state";
import { skeletonContent } from "./skeleton";
import { toastContent } from "./toast";
import { tooltipContent } from "./tooltip";
import { menuContent } from "./menu";
import { modalContent } from "./modal";
import { drawerContent } from "./drawer";
import { activityTimelineContent } from "./activity-timeline";
import { stepperContent } from "./stepper";
import { notificationMenuContent } from "./notification-menu";
import { fileInputContent } from "./file-input";
import { fileUploaderContent } from "./file-uploader";
import { navbarContent } from "./navbar";
import { sidebarContent } from "./sidebar";
import { appShellContent } from "./app-shell";

export type {
  ComponentContent,
  UsageGuidance,
  AccessibilityRow,
  AnatomyContent,
  AnatomyPart,
  AnatomyState,
  DoDontPair,
} from "./types";

const contentByComponent: Record<string, ComponentContent> = {
  button: buttonContent,
  input: inputContent,
  "search-field": searchFieldContent,
  card: cardContent,
  badge: badgeContent,
  tag: tagContent,
  select: selectContent,
  combobox: comboboxContent,
  checkbox: checkboxContent,
  "radio-group": radioGroupContent,
  switch: switchContent,
  table: tableContent,
  pagination: paginationContent,
  "pagination-bar": paginationBarContent,
  chip: chipContent,
  "segmented-control": segmentedControlContent,
  slider: sliderContent,
  tabs: tabsContent,
  accordion: accordionContent,
  popover: popoverContent,
  "filter-button": filterButtonContent,
  "command-palette": commandPaletteContent,
  alert: alertContent,
  avatar: avatarContent,
  progress: progressContent,
  "level-meter": levelMeterContent,
  "seniority-card": seniorityCardContent,
  breadcrumb: breadcrumbContent,
  link: linkContent,
  meter: meterContent,
  sparkline: sparklineContent,
  kbd: kbdContent,
  textarea: textareaContent,
  "option-card": optionCardContent,
  "capacity-bar": capacityBarContent,
  "distribution-card": distributionCardContent,
  "date-field": dateFieldContent,
  "date-range-field": dateRangeFieldContent,
  "empty-state": emptyStateContent,
  skeleton: skeletonContent,
  toast: toastContent,
  tooltip: tooltipContent,
  menu: menuContent,
  modal: modalContent,
  drawer: drawerContent,
  "activity-timeline": activityTimelineContent,
  stepper: stepperContent,
  "notification-menu": notificationMenuContent,
  "file-input": fileInputContent,
  "file-uploader": fileUploaderContent,
  navbar: navbarContent,
  sidebar: sidebarContent,
  "app-shell": appShellContent,
};

/**
 * Curated content is written by hand, so a newly added component has none
 * until someone writes it. Returning undefined lets the tabs render an explicit
 * "pending" state, which keeps the gap visible instead of silently empty.
 */
export function getContent(componentName: string): ComponentContent | undefined {
  return contentByComponent[componentName];
}
