import {
  Button,
  Icon,
  NotificationMenu,
  NotificationMenuFooter,
  NotificationMenuHeader,
  NotificationMenuItem,
  NotificationMenuList,
} from "@tuya-ui/components";

export const meta = {
  title: "Panel de notificaciones",
  description: "Las cuatro notificaciones reales de la fuente: dos sin leer, dos ya leídas.",
  caption: "unread resuelve fondo y peso juntos — nunca uno sin el otro",
};

export default function Example() {
  return (
    <NotificationMenu
      trigger={
        <Button variant="secondary">
          <Icon name="notification" size={20} label="Notificaciones" />
        </Button>
      }
    >
      <NotificationMenuHeader title="Notificaciones" action="Marcar todas leídas" onActionSelect={() => {}} />
      <NotificationMenuList>
        <NotificationMenuItem
          unread
          variant="danger"
          label="3 células superaron su umbral"
          detail="Bogotá · Centro concentra 2 de las 3."
          timestamp="hace 12 min"
          onSelect={() => {}}
        />
        <NotificationMenuItem
          unread
          variant="warning"
          label="SOL-2041 espera tu aprobación"
          detail="M. Restrepo solicitó +4,0 Gbps para CEL-00842."
          timestamp="hace 1 h"
          onSelect={() => {}}
        />
        <NotificationMenuItem
          label="Proyección mensual disponible"
          detail="Agosto 2026 · 14 zonas con riesgo a 90 días."
          timestamp="hoy 07:00"
          onSelect={() => {}}
        />
        <NotificationMenuItem
          label="Ampliación completada"
          detail="CEL-00755 quedó en 61% de utilización."
          timestamp="ayer"
          onSelect={() => {}}
        />
      </NotificationMenuList>
      <NotificationMenuFooter onSelect={() => {}}>Ver todas</NotificationMenuFooter>
    </NotificationMenu>
  );
}
