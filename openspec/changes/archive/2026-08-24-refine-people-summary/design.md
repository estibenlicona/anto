## Decisions

1. "N en M células" no puede salir del mock de personas (no importa asignaciones, la dependencia va en un solo sentido): el container lo deriva del overview de capacidad (`peopleTotal - peopleUnassigned`, células con equipo) y lo pasa como `assignment`; sin él la card omite esa lectura y el enlace.
2. Stacks sin respaldo usa roles de estado (éxito/advertencia), no tonos: "sin respaldo" sí es una advertencia.
3. Seniority abre con el % en avanzado o superior: es la lectura que el Chapter Lead usa; el total de personas ya está en la primera card.
