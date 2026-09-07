## REMOVED Requirements

### Requirement: Cola de triage del backlog
**Reason**: la clasificación Iniciativa / BAU llega de Azure DevOps como etiqueta de cada historia, y la pregunta del Líder de Expertise es otra: cuánta dedicación real tiene cada capacidad frente a la asignada. El módulo Backlog se retira entero y lo reemplaza la capability `real-dedication` (**Dedicación real**).
**Migration**: la ruta `/app/lead/backlog` desaparece y la entrada de navegación pasa a ser "Dedicación" (`/app/lead/dedicacion`); las historias se leen con su etiqueta desde Azure y no hay datos de clasificación que migrar (sólo existían en el mock). La vinculación de identidades sigue en la ficha de la persona.

### Requirement: Clasificar, saltar y deshacer
**Reason**: sin cola de triage no hay nada que clasificar, saltar ni deshacer; la etiqueta de la historia viene de Azure DevOps.
**Migration**: ninguna acción equivalente; lo sin etiqueta se muestra como tal en la dedicación real de la capacidad.

### Requirement: Rechazar una historia con motivo
**Reason**: la plataforma no corrige a DevOps; una historia mal asignada se corrige en Azure DevOps y la siguiente actualización la refleja.
**Migration**: los rechazos trazados sólo existían en el mock; no hay datos que conservar.
