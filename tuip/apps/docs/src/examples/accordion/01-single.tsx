import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@tuya-ui/components";

export const meta = {
  title: "Single",
  description: "A lo sumo un ítem abierto a la vez — modo por defecto.",
  caption: "Accordion con type=\"single\" defaultValue",
};

export default function Example() {
  return (
    <Accordion type="single" defaultValue="facturacion" className="w-full max-w-md">
      <AccordionItem value="plan">
        <AccordionTrigger>¿Qué incluye el plan?</AccordionTrigger>
        <AccordionContent>
          Acceso a todos los componentes del catálogo y sus actualizaciones, sin costo adicional por
          proyecto.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="facturacion">
        <AccordionTrigger>¿Cómo se factura?</AccordionTrigger>
        <AccordionContent>
          Mensualmente, por número de proyectos activos en el workspace.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="cancelacion">
        <AccordionTrigger>¿Puedo cancelar en cualquier momento?</AccordionTrigger>
        <AccordionContent>Sí, sin período de permanencia ni penalidad.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
