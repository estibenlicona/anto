## ADDED Requirements

### Requirement: El módulo de iconos generado contiene solo geometría
La extracción de iconos SHALL admitir únicamente un conjunto cerrado de elementos y atributos de dibujo, y SHALL rechazar el icono que traiga cualquier cosa fuera de ese conjunto en vez de copiarla al módulo generado. El rechazo SHALL informar qué icono y qué elemento o atributo lo motivó, y SHALL no repararse en silencio: el documento de diseño se edita a mano, y algo inesperado ahí es un problema del documento que conviene ver, no limpiar. El módulo generado SHALL no contener nada que pueda interpretarse como código al importarlo, cualquiera sea el contenido del documento de origen.

#### Scenario: Un icono con un atributo de evento
- **WHEN** un icono del documento de origen trae un atributo que ejecuta código ante un evento
- **THEN** la extracción lo rechaza nombrando el icono y el atributo, y ese contenido no llega al módulo generado

#### Scenario: Un elemento fuera del conjunto admitido
- **WHEN** un icono del documento de origen trae un elemento que no pertenece al conjunto de figuras de dibujo admitidas
- **THEN** la extracción lo rechaza en vez de incorporarlo al módulo generado

#### Scenario: Contenido que en el módulo generado sería código
- **WHEN** el cuerpo de un icono contiene una secuencia que, escrita tal cual en el módulo generado, se interpretaría como una expresión a evaluar en lugar de como texto
- **THEN** el módulo generado la contiene como texto literal, sin que se evalúe al importarlo

#### Scenario: Los iconos existentes siguen extrayéndose
- **WHEN** se corre la extracción sobre el documento de diseño vigente
- **THEN** todos los iconos que la librería ya publica se extraen sin ser rechazados, porque el conjunto admitido se derivó del set existente
