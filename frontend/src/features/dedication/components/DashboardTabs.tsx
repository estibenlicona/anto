import React from "react";
import {
  Card,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@tuya-ui/components";
import type {
  DashboardTab,
  DashboardTabId,
} from "../adapters/DedicationAdapter";

export interface DashboardTabsProps {
  tabs: DashboardTab[];
  value: DashboardTabId;
  onValueChange: (id: DashboardTabId) => void;
  /** El contenido de cada pestaña, por id. */
  children: Partial<Record<DashboardTabId, React.ReactNode>>;
}

/**
 * Las cuatro pestañas de la ficha, encabezando una sola tarjeta.
 *
 * **El subtítulo es lo que impide que las pestañas escondan algo**: dice qué
 * hay dentro de cada una sin abrirla, así que se entra a la que interesa en
 * lugar de recorrer las cuatro. Es la `description` de tuip, y la lista va en
 * su variante `surface` porque es el encabezado de la card, no un divisor
 * dentro de ella.
 */
export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  tabs,
  value,
  onValueChange,
  children,
}) => (
  <Card className="overflow-hidden">
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as DashboardTabId)}
    >
      <TabsList variant="surface" aria-label="Detalle del sprint">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} description={tab.subtitle}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="pt-0">
          {children[tab.id]}
        </TabsContent>
      ))}
    </Tabs>
  </Card>
);
