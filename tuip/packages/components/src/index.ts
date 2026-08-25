export * from "./alert";
export * from "./button";
export * from "./input";
export * from "./textarea";
export * from "./search-field";
export * from "./card";
export * from "./level-meter";
export * from "./seniority-card";
export * from "./badge";
export * from "./tag";
export * from "./select";
export * from "./combobox";
export * from "./checkbox";
export * from "./radio-group";
export * from "./switch";
export * from "./table";
export * from "./pagination";
export * from "./pagination-bar";
export * from "./chip";
export * from "./segmented-control";
export * from "./slider";
export * from "./tabs";
export * from "./accordion";
export * from "./popover";
export * from "./filter-button";
export * from "./command-palette";
export * from "./avatar";
export * from "./progress";
export * from "./meter";
export * from "./capacity-bar";
export * from "./distribution-card";
export * from "./sparkline";
export * from "./breadcrumb";
export * from "./link";
export * from "./kbd";
export * from "./option-card";
export * from "./date-calendar";
export * from "./date-field";
export * from "./date-range-field";
export * from "./empty-state";
export * from "./skeleton";
export * from "./toast";
export * from "./tooltip";
export * from "./menu";
export * from "./modal";
export * from "./drawer";
export * from "./activity-timeline";
export * from "./stepper";
export * from "./notification-menu";
export * from "./file-input";
export * from "./file-uploader";
export * from "./navbar";
export * from "./sidebar";
export * from "./app-shell";
export * from "./icon";
export * from "./icons/paths";
export * from "./lib/cn";
// El vocabulario categórico se exporta entero. Llegaba sólo como `TagColor`,
// que alcanzaba mientras `Tag` era su único consumidor; desde que las partes
// de `CapacityBar` también lo declaran, ese alias describe mal lo que se está
// nombrando — y sin el tipo a mano, la opción no se puede escribir con tipos
// desde afuera. `TagColor` sigue siendo un alias suyo.
export * from "./lib/categorical-color";
// El reparto de identidad se exporta entero por el mismo motivo: un consumidor
// puede necesitar el color de una persona fuera de un Avatar — en un gráfico,
// por ejemplo — y tiene que salirle el mismo.
export * from "./lib/identity-color";
// El vocabulario de tonos de acento se exporta entero por el mismo motivo: la
// escala tiene orden, y un consumidor que arme su propio medidor sobre
// `LevelMeter` necesita el mismo reparto de matices que usa `SeniorityCard`.
export * from "./lib/accent-tone";
export * from "./lib/severity";
