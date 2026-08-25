import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@tuya-ui/components";

export const meta = {
  title: "Ítem deshabilitado",
  description: "Un ítem deshabilitado no responde a mouse ni teclado.",
  caption: "AccordionItem con disabled",
};

export default function Example() {
  return (
    <Accordion type="single" defaultValue="disponible" className="w-full max-w-md">
      <AccordionItem value="disponible">
        <AccordionTrigger>Integración con Slack</AccordionTrigger>
        <AccordionContent>Disponible en el plan actual.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="bloqueada" disabled>
        <AccordionTrigger>Integración con SSO corporativo</AccordionTrigger>
        <AccordionContent>Requiere el plan Enterprise.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
