# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Líder de Expertise (Chapter Lead)** — el usuario principal. Lidera una línea de expertise (Backend, QA, Datos…) y gestiona la capacidad de su gente desde el shell `/app/lead`: personas, células, asignaciones, backlog, ausencias, prefacturas y competencias. Trabaja en escritorio, en sesiones de gestión (no en el flujo de un desarrollador), con muchas personas a cargo y poco tiempo por pantalla: necesita leer el estado de un vistazo y actuar (asignar, reasignar, bajar carga).
- **Administrador de plataforma** — mantiene el instrumento: calendario de sprints, parámetros del modelo de estimación, catálogo de habilidades, líneas de expertise e integración con Azure DevOps (`/app/admin`).
- **Colaborador, Líder Técnico y Product Owner** — roles definidos en el modelo (`PersonRole`) y en `context/docs/Roles_y_Permisos_Plataforma.md`, todavía sin pantallas propias.

## Product Purpose

Plataforma de Dimensionamiento y Gestión de Capacidad de Tuya. Responde, antes de que exista backlog refinado, cuántas personas, de qué capacidades y a qué nivel necesita una iniciativa; y después, si la capacidad asignada a cada célula se corresponde con la realidad. El éxito es que el Chapter Lead vea a simple vista dónde sobra y dónde falta dedicación, y reasigne a tiempo.

## Positioning

Dimensiona iniciativas por talla (T-shirt sizing → FTE esperado y mix de capacidades) antes de que exista backlog, asigna personas a células con una dedicación declarada, y contrasta esa dedicación con la realidad que trae Azure DevOps —historias de usuario comprometidas por sprint y commits— sin registro manual de horas. Ninguna otra herramienta interna une el dimensionamiento temprano con la lectura real del trabajo.

## Operating Context

- Especificación maestra: `context/docs/Especificacion_Plataforma_Dimensionamiento_Capacidad.md`; modelo conceptual: `context/docs/Contexto_Modelo_Dimensionamiento_Celulas_TI.md`; roles: `context/docs/Roles_y_Permisos_Plataforma.md`.
- Las decisiones de comportamiento viven en OpenSpec (`openspec/specs`, un directorio por capability) y cada cambio pasa por proposal → specs → design → tasks.
- El frontend (React + TypeScript, Vite) corre con mocks MSW (`pnpm dev:mock`) y un simulador de sesión; el backend .NET existe para personas, células, asignaciones e iniciativas, pero todavía no integra Azure DevOps.
- Azure DevOps es la fuente del trabajo real: identidades de usuario, sprints (iteraciones), historias de usuario con puntos y etiquetas, y commits. La plataforma lo lee; nunca lo modifica.
- Vocabulario propio: *capacidad* = persona; *célula* = squad; *línea de expertise*; *chapter*; *iniciativa* con *talla* y *FTE esperado*; *dedicación* declarada por asignación (con reparto BAU / Transformación); *BAU* = trabajo recurrente fuera de iniciativas; escala SFIA propia de Tuya (1–4).

## Capabilities and Constraints

- Capacidades existentes: personas (alta, ficha, stacks, vinculación con Azure DevOps por correo), células, asignaciones y Torre de control, iniciativas y su evaluación (talla, FTE esperado), ausencias, prefacturas, competencias y planes de carrera, líneas de expertise, administración de parámetros y calendario de sprints.
- No hay registro de horas: se retiró deliberadamente; el trabajo real se lee en los items de DevOps.
- Azure DevOps es solo lectura. Los contratos de integración se fijan en el frontend (servicios tipados + handlers de mock) y el backend los honra después.
- Sistema de diseño obligatorio: **tuip** (`tuip/`), con tokens en dos capas, IBM Plex Sans, rojo Tuya para la acción primaria (una por vista) y componentes React (`@tuya-ui/components`). Las pantallas nuevas extienden ese vocabulario; no inventan otro.
- Texto en español neutro y consistente (capability `ui-writing`); sin descripciones de módulo ni notas al pie que expliquen la pantalla.
- Decisión abierta: la herencia de la dedicación sugerida por la evaluación de la iniciativa al asignar una persona a la célula (change aparte).

## Brand Commitments

Tuya. El sistema de diseño tuip es la identidad visual: rojo Tuya (`#ED1C29` / acción `#C9151F`), neutros fríos, IBM Plex Sans e IBM Plex Mono para identificadores, radios 8 px (controles) y 12 px (superficies), una sola acción primaria por vista. Documentado en `tuip/DESIGN.md`.

## Evidence on Hand

- Datos de ejemplo sembrados en los mocks (personas, células, asignaciones, iniciativas, identidades DevOps). Son ficción declarada: ninguna cifra sembrada es evidencia real.
- No hay datos reales de Azure DevOps, ni capturas de producción, ni testimonios. Ningún diseño debe presentar cifras de muestra como reales.

## Product Principles

- Cada dato aparece una sola vez y donde se decide con él.
- Lo que no tiene origen no se muestra: sin cifras inventadas, sin "reales" que no salgan de DevOps.
- Una acción primaria por vista; la lectura precede a la acción (ver el estado, luego reasignar).
- Consistencia sobre sorpresa: mismas superficies, controles y palabras en todas las pantallas del shell.
- La plataforma observa a DevOps; no lo corrige ni lo duplica.
