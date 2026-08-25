## Purpose

Empaqueta el conocimiento del sistema de diseño Tuya UI — catálogo de componentes, props, lineamientos de uso y ejemplos — como una Skill de Claude que un modelo de IA carga bajo demanda al construir UI, en vez de tener que redescubrirlo leyendo código fuente o generando componentes desde cero.

## ADDED Requirements

### Requirement: Punto de entrada de la Skill
La Skill SHALL exponer un `SKILL.md` con metadatos que permitan a Claude decidir cuándo activarla, cuyo campo de descripción SHALL mencionar explícitamente que cubre la construcción de interfaces con `@tuya-ui/components` y el sistema de diseño Tuya, de modo que se active al pedir una pantalla, un formulario o un componente de UI en un proyecto que usa la librería.

#### Scenario: Activación al construir UI
- **WHEN** un usuario le pide a Claude que arme una pantalla o un formulario en un proyecto que tiene `@tuya-ui/components` instalado
- **THEN** la descripción de la Skill contiene términos suficientes para que Claude la reconozca como aplicable a esa tarea

#### Scenario: El punto de entrada no listado todo el catálogo
- **WHEN** Claude carga `SKILL.md`
- **THEN** encuentra un resumen del sistema y una guía de qué archivo de referencia abrir según lo que necesite, no el detalle de los más de 35 componentes ya cargado de una vez

### Requirement: Referencias organizadas por categoría
La Skill SHALL organizar el detalle de los componentes en archivos de referencia separados por categoría (acciones, formularios, feedback, layout, overlays), de modo que Claude pueda leer solo la categoría relevante a la tarea en vez de cargar el catálogo completo.

#### Scenario: Construir un formulario carga solo la referencia de formularios
- **WHEN** Claude necesita elegir entre Input, Select y Combobox para un formulario
- **THEN** abre el archivo de referencia de la categoría "formularios", sin necesidad de leer los archivos de las demás categorías

### Requirement: Contenido por componente
Cada entrada de componente en los archivos de referencia SHALL incluir su nombre de import, su estado de madurez (`stable` o `beta`), una descripción breve, su tabla de props (nombre, tipo, si es requerida, valor por defecto, descripción), al menos un fragmento de código de ejemplo tomado de los ejemplos reales del sitio de documentación, y su orientación de uso (cuándo corresponde y cuándo no).

#### Scenario: Elegir el componente correcto
- **WHEN** Claude necesita decidir si un campo booleano corresponde a Checkbox o a Switch
- **THEN** la orientación de uso del componente en la referencia distingue los dos casos, igual que la guía del sitio de documentación

#### Scenario: Ejemplo de código listo para reutilizar
- **WHEN** Claude necesita mostrar un Button con ícono y variante primaria
- **THEN** encuentra en la referencia un fragmento de código ya armado para ese caso, que puede adaptar en lugar de escribir desde cero

### Requirement: Referencia de fundamentos e iconografía
La Skill SHALL incluir una referencia de fundamentos con las reglas de aplicación de los tokens de marca (color, espaciado) más citadas en la documentación, y una referencia de iconografía con los nombres válidos de ícono agrupados por familia.

#### Scenario: Elegir un ícono por nombre válido
- **WHEN** Claude necesita pasar un ícono a un componente
- **THEN** la referencia de iconografía lista el nombre exacto del ícono a usar, evitando que invente un nombre que no existe en el catálogo

#### Scenario: Aplicar la regla de escasez del color de marca
- **WHEN** Claude arma una vista con más de una acción
- **THEN** la referencia de fundamentos indica que el color de marca se reserva para la acción principal, la misma regla que ya documenta el sitio

### Requirement: Generación automática desde las fuentes existentes
El contenido de los archivos de referencia SHALL generarse mediante un script a partir de `registry.json`, las guías de uso de `apps/docs/src/content` y los ejemplos de `apps/docs/src/examples`, en vez de redactarse o mantenerse a mano, de modo que un cambio en un componente se refleje en la Skill sin edición manual paralela.

#### Scenario: Un componente nuevo aparece en la Skill sin trabajo manual
- **WHEN** se agrega un componente nuevo al catálogo y se corre el script de generación
- **THEN** el componente nuevo aparece en el archivo de referencia de su categoría, con sus props y su orientación de uso, sin que nadie haya escrito ese contenido a mano

#### Scenario: Un cambio de prop se refleja en la Skill
- **WHEN** cambia el nombre o el tipo de una prop de un componente existente y se corre el script de generación
- **THEN** la tabla de props de la referencia de ese componente refleja el cambio

#### Scenario: Generación falla si falta la fuente principal
- **WHEN** el script de generación no encuentra `registry.json`
- **THEN** falla con un mensaje que identifica qué falta, en vez de generar una referencia vacía o incompleta silenciosamente

#### Scenario: Componente sin guía de uso todavía
- **WHEN** un componente del catálogo no tiene guía de uso redactada en `apps/docs/src/content`
- **THEN** la generación no falla por eso: la entrada de ese componente en la referencia incluye igual su import, sus props y sus ejemplos, y omite la sección de orientación de uso en vez de bloquear al resto del catálogo
