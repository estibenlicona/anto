# MVPs · Plataforma de Dimensionamiento y Capacidad

## Vigente

**[`plataforma_dimensionamiento_v7_unificado.html`](plataforma_dimensionamiento_v7_unificado.html)** — MVP unificado. Absorbe los seis prototipos anteriores en uno solo.

Ábrelo directamente en el navegador: es un HTML autónomo, sin dependencias externas ni conexión a red.

**Qué incluye:**

| Módulo | Pantallas |
|---|---|
| Dimensionamiento | Evaluar iniciativa (scoring funcional), Portafolio, Capacidad vs Demanda, Calibración |
| Gestión de Capacidad | Células (+ detalle con Resumen/Backlog/Board/Equipo), Iniciativas, Capacidades (+ rebalanceo), Backlogs (clasificación + curación), Reporte de Horas |
| Integraciones | Estado de vínculos e identidades |
| Administración | Calendario de sprints, Parámetros del modelo, Conexión y job de ingesta |

**Cómo recorrerlo:**

- **Selector de rol** (topbar) — cambia entre *Chapter Lead*, *Colaborador* y *Admin de plataforma*. Cada rol tiene su propia navegación y sus propias pantallas.
- **Toggle de tema** (☀ en la topbar) — alterna entre azul corporativo y la paleta Tuya. La elección persiste.
- **Evaluar iniciativa** — usa los botones de ejemplo (pequeño / mediano / grande) para precargar un caso y ver talla, PM, FTE y mix de capacidades calculados en vivo.

> Los niveles SFIA usan la **escala propia de Tuya (1–4)**: 1 Principiante · 2 Competente · 3 Avanzado · 4 Experto.
> El mix de capacidades heredado del v1 fue remapeado desde la escala 0–7 (ver punto abierto A-10 del documento maestro).

## Histórico

Los seis prototipos anteriores están en [`_historico/`](_historico/). Se conservan como registro de la evolución del producto; **no son fuente de verdad**.

| Versión | Foco | Aporte único | En v7 |
|---|---|---|:---:|
| [v1](_historico/plataforma_dimensionamiento_v1.html) | Modelo de scoring | Motor completo: 7 dimensiones, 30 preguntas con pesos, triaje, tallas XS–XL, mix de capacidades, gauge, temas azul/Tuya | ✅ lógica + diseño |
| [v2](_historico/plataforma_dimensionamiento_v2_extended_mod_capacidad.html) | Costos y expertos de línea | Dimensión económica (costo por persona/célula/proveedor), concordancia seniority-costo-criticidad, mapa de conocimientos, span de control, carga masiva | 🟡 parcial |
| [v3](_historico/plataforma_dimensionamiento_v3_squad_capacity_devops.html) | Squad capacity + DevOps | Integración DevOps completa, vinculación en 2 sesiones, sync preview→apply, identidades Entra ID, curación, reporte de horas, estimación por etapas, calendario de sprints | ✅ |
| [v4](_historico/plataforma_dimensionamiento_v4_ux.html) | UX rediseñada | Journey configura/opera/analiza, "Pendientes para ti", wizard guiado, anillos de progreso | ✅ patrones UX |
| [v5](_historico/plataforma_dimensionamiento_v5_chapter_lead.html) | Chapter Lead | Vista transversal multi-célula, torre de control, alertas del chapter, rebalanceo entre células, bus factor | ✅ |
| [v6](_historico/plataforma_dimensionamiento_v6_backend_driven.html) | Backend-driven | Base local espejada por job de ingesta, formularios con vinculación opcional, clasificación inline por pill-menu | ✅ |

**Lo que quedó fuera del v7** (de v2, pendiente de decidir si entra al alcance): dimensión económica y de costos, mapa de conocimientos, span de control y carga masiva vía Excel.

## Documento maestro

El alcance, las reglas de negocio, los roles, los flujos y las cadenas de aprobación están en
[`../context/Especificacion_Plataforma_Dimensionamiento_Capacidad.md`](../context/Especificacion_Plataforma_Dimensionamiento_Capacidad.md).
