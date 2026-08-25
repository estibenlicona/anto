import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tuya-ui/components";

export const meta = {
  title: "Con contador",
  description: "El contador se muestra junto a la etiqueta, en fuente monoespaciada.",
  caption: "TabsTrigger con count",
};

export default function Example() {
  return (
    <Tabs defaultValue="capacidades">
      <TabsList>
        <TabsTrigger value="resumen">Resumen</TabsTrigger>
        <TabsTrigger value="capacidades" count={24}>
          Capacidades
        </TabsTrigger>
        <TabsTrigger value="iniciativas" count={7}>
          Iniciativas
        </TabsTrigger>
      </TabsList>
      <TabsContent value="resumen">
        <p className="text-body-sm text-neutral-subtle">Vista general del sprint actual.</p>
      </TabsContent>
      <TabsContent value="capacidades">
        <p className="text-body-sm text-neutral-subtle">24 personas asignadas a la célula.</p>
      </TabsContent>
      <TabsContent value="iniciativas">
        <p className="text-body-sm text-neutral-subtle">7 iniciativas activas.</p>
      </TabsContent>
    </Tabs>
  );
}
