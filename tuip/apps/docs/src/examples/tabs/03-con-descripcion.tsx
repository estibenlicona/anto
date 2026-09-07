import { Card, Tabs, TabsContent, TabsList, TabsTrigger } from "@tuya-ui/components";

export const meta = {
  title: "Con descripción, encabezando una card",
  description:
    "Cada pestaña resume lo que guarda debajo de su etiqueta, para elegir sin abrir. La lista en variante surface hace de encabezado de la card.",
  caption: 'TabsTrigger con description + TabsList variant="surface"',
};

export default function Example() {
  return (
    <Card className="overflow-hidden">
      <Tabs defaultValue="senales">
        <TabsList variant="surface" aria-label="Detalle del sprint">
          <TabsTrigger value="senales" description="3 de 6 fuera de tolerancia">
            Señales
          </TabsTrigger>
          <TabsTrigger value="historias" description="6 historias · 30 SP">
            Historias
          </TabsTrigger>
          <TabsTrigger value="actividad" description="5 días activos · 24 commits">
            Actividad
          </TabsTrigger>
          <TabsTrigger value="tendencia" description="7 sprints · +0.4 %">
            Tendencia
          </TabsTrigger>
        </TabsList>
        <TabsContent value="senales" className="px-4 pb-4">
          <p className="text-body-sm text-neutral-subtle">
            Las seis evidencias del sprint, cada una con su valor y su tolerancia.
          </p>
        </TabsContent>
        <TabsContent value="historias" className="px-4 pb-4">
          <p className="text-body-sm text-neutral-subtle">
            Las historias comprometidas en el sprint.
          </p>
        </TabsContent>
        <TabsContent value="actividad" className="px-4 pb-4">
          <p className="text-body-sm text-neutral-subtle">
            Un día por celda, con la intensidad de lo hecho.
          </p>
        </TabsContent>
        <TabsContent value="tendencia" className="px-4 pb-4">
          <p className="text-body-sm text-neutral-subtle">
            Un sprint por fila, del más reciente al más antiguo.
          </p>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
