import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@tuya-ui/components";

export const meta = {
  title: "Multiple",
  description: "Varios ítems pueden permanecer abiertos en simultáneo.",
  caption: "Accordion con type=\"multiple\"",
};

export default function Example() {
  return (
    <Accordion type="multiple" defaultValue={["riesgos", "capacidad"]} className="w-full max-w-md">
      <AccordionItem value="riesgos">
        <AccordionTrigger>Riesgos abiertos</AccordionTrigger>
        <AccordionContent>Dos riesgos sin mitigación asignada para este sprint.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="capacidad">
        <AccordionTrigger>Capacidad asignada</AccordionTrigger>
        <AccordionContent>8 personas, 320 horas disponibles en el sprint actual.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="historial">
        <AccordionTrigger>Historial de cambios</AccordionTrigger>
        <AccordionContent>Sin cambios de asignación en los últimos dos sprints.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
