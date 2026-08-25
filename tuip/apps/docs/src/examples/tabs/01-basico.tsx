import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tuya-ui/components";

export const meta = {
  title: "Básico",
  description: "Cuatro secciones, sin contador.",
  caption: "Tabs con defaultValue — no controlado",
};

export default function Example() {
  return (
    <Tabs defaultValue="resumen">
      <TabsList>
        <TabsTrigger value="resumen">Resumen</TabsTrigger>
        <TabsTrigger value="capacidades">Capacidades</TabsTrigger>
        <TabsTrigger value="iniciativas">Iniciativas</TabsTrigger>
        <TabsTrigger value="historial">Historial</TabsTrigger>
      </TabsList>
      <TabsContent value="resumen">
        <p className="text-body-sm text-neutral-subtle">
          Vista general del sprint actual: velocidad, capacidad asignada y riesgos abiertos.
        </p>
      </TabsContent>
      <TabsContent value="capacidades">
        <p className="text-body-sm text-neutral-subtle">
          Lista de personas asignadas a la célula, con su FTE y horas del sprint.
        </p>
      </TabsContent>
      <TabsContent value="iniciativas">
        <p className="text-body-sm text-neutral-subtle">
          Iniciativas activas de la célula, con su estimación y estado.
        </p>
      </TabsContent>
      <TabsContent value="historial">
        <p className="text-body-sm text-neutral-subtle">
          Cambios de asignación de los últimos sprints.
        </p>
      </TabsContent>
    </Tabs>
  );
}
