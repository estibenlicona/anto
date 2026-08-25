import { useState } from "react";
import { Button, Card, CardBody, CardFooter, DateField, Input, Stepper, StepperStep } from "@tuya-ui/components";

export const meta = {
  title: "Solicitud de ampliación",
  description: "El flujo de la fuente: tres pasos, cada uno validado antes de avanzar al siguiente.",
  caption: "El status de cada StepperStep se calcula desde el índice actual — Stepper no lo infiere solo",
};

const steps = [
  { label: "Recurso", description: "CEL-00842" },
  { label: "Dimensionamiento", description: "capacidad y fecha" },
  { label: "Aprobación", description: "revisión final" },
];

export default function Example() {
  const [current, setCurrent] = useState(0);
  const [capacity, setCapacity] = useState("4,0");
  const [targetDate, setTargetDate] = useState("2026-09-15");

  return (
    <Card className="w-full max-w-[560px]">
      <div className="border-b border-neutral-default px-6 py-5">
        <Stepper>
          {steps.map((step, index) => (
            <StepperStep
              key={step.label}
              step={index + 1}
              label={step.label}
              description={index === current ? step.description : index < current ? "hecho" : "pendiente"}
              status={index < current ? "completed" : index === current ? "current" : "pending"}
            />
          ))}
        </Stepper>
      </div>

      <CardBody>
        {current === 0 && <p className="text-body-sm text-neutral-subtle">CEL-00842 · Backend Platform · Bogotá.</p>}
        {current === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Capacidad adicional (Gbps)"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
            />
            <DateField label="Fecha objetivo" value={targetDate} onValueChange={setTargetDate} />
          </div>
        )}
        {current === 2 && (
          <p className="text-body-sm text-neutral-subtle">
            +{capacity} Gbps para CEL-00842, efectiva el {targetDate}. Lista para enviar a aprobación.
          </p>
        )}
      </CardBody>

      <CardFooter className="flex justify-end gap-3">
        <Button variant="secondary" disabled={current === 0} onClick={() => setCurrent((step) => step - 1)}>
          Atrás
        </Button>
        <Button
          variant="primary"
          onClick={() => setCurrent((step) => Math.min(step + 1, steps.length - 1))}
          disabled={current === steps.length - 1}
        >
          Continuar
        </Button>
      </CardFooter>
    </Card>
  );
}
