import { ActivityTimeline, ActivityTimelineItem, Card, CardBody, CardHeader } from "@tuya-ui/components";

export const meta = {
  title: "Traza de aprobación",
  description: "Cuatro eventos de una solicitud de ampliación, montados dentro de una Card — ActivityTimeline no trae su propia superficie.",
  caption: "ActivityTimeline dentro de CardBody, un ActivityTimelineItem por evento",
};

export default function Example() {
  return (
    <Card className="w-full max-w-[560px]">
      <CardHeader>
        <span className="text-body-sm font-semibold text-neutral-default">Actividad</span>
      </CardHeader>
      <CardBody>
        <ActivityTimeline>
          <ActivityTimelineItem
            variant="success"
            actor="C. Ospina"
            action="aprobó la ampliación"
            detail="SOL-2041 · +4,0 Gbps para CEL-00842, efectiva el 15 sep."
            timestamp="hoy 09:41"
          />
          <ActivityTimelineItem
            variant="danger"
            actor="Sistema"
            action="detectó umbral superado"
            detail="CEL-00907 alcanzó 95% de utilización (umbral 85%)."
            timestamp="hoy 06:02"
          />
          <ActivityTimelineItem
            variant="info"
            actor="M. Restrepo"
            action="creó la solicitud"
            detail="SOL-2041 · justificación: proyección supera umbral en 60 días."
            timestamp="ayer 17:20"
          />
          <ActivityTimelineItem
            variant="neutral"
            actor="J. Betancur"
            action="actualizó el umbral de zona"
            detail="Bogotá · Centro pasó de 80% a 85%."
            timestamp="6 ago 11:05"
          />
        </ActivityTimeline>
      </CardBody>
    </Card>
  );
}
