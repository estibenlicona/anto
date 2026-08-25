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
  title: "Más de las que entran",
  description: "Con más notificaciones de las que caben en el alto del panel, la lista desplaza — el header y el footer quedan fijos.",
  caption: "NotificationMenuList es la única pieza que hace scroll",
};

const items = Array.from({ length: 9 }, (_, index) => ({
  label: `Notificación ${index + 1}`,
  detail: "Contenido de ejemplo para ocupar una línea de detalle.",
  timestamp: `hace ${index + 1} h`,
}));

export default function Example() {
  return (
    <NotificationMenu
      trigger={
        <Button variant="secondary">
          <Icon name="notification" size={20} label="Notificaciones" />
        </Button>
      }
    >
      <NotificationMenuHeader title="Notificaciones" />
      <NotificationMenuList>
        {items.map((item) => (
          <NotificationMenuItem key={item.label} {...item} onSelect={() => {}} />
        ))}
      </NotificationMenuList>
      <NotificationMenuFooter onSelect={() => {}}>Ver todas</NotificationMenuFooter>
    </NotificationMenu>
  );
}
