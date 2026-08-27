# billing-period-view Specification

## Purpose

Define cómo se compone la vista de facturación (prefacturas de un período) del chapter lead: qué bloques la forman, en qué orden aparecen, dónde viven el navegador de período y las acciones de generar y registrar, qué meses admite el navegador y cómo se mantiene el encabezado accesible sin ocupar espacio visible.

## Requirements

### Requirement: La vista abre con el resumen, sin encabezado de módulo visible
La vista de facturación NO SHALL mostrar un título de módulo ni una descripción visibles: el nombre de la pantalla ya lo da el breadcrumb del shell ("Prefacturación"). El primer bloque visible del contenido SHALL ser el resumen (cards del período), seguido de la tabla de prefacturas.

#### Scenario: Primer pantallazo con prefacturas cargadas
- **WHEN** el usuario entra a `/app/lead/facturacion` y el período tiene personas externas
- **THEN** no se muestra ningún texto "Prefacturas" ni "Revisa lo que cada proveedor propone cobrar…" como encabezado de la vista
- **AND** las cards del período son el primer bloque visible del contenido, y la tabla va inmediatamente después

### Requirement: La página conserva un único encabezado de nivel 1 accesible
La página SHALL exponer exactamente un encabezado de nivel 1 con el texto "Prefacturación", disponible para tecnologías de asistencia pero no visible en pantalla.

#### Scenario: Navegación por encabezados con lector de pantalla
- **WHEN** un lector de pantalla enumera los encabezados de `/app/lead/facturacion`
- **THEN** encuentra un único encabezado de nivel 1, con el texto "Prefacturación"
- **AND** ese encabezado no ocupa espacio visible en la vista

### Requirement: El navegador de período y las dos acciones viven en la franja del breadcrumb
Mientras la vista de facturación está montada dentro del shell, SHALL publicar en la franja del breadcrumb un bloque con, de izquierda a derecha: el navegador de período (ir al mes anterior, el mes visible, ir al mes siguiente), la acción secundaria "Generar el esperado del mes" y la acción primaria "Registrar prefactura". El bloque SHALL mostrarse a la derecha de la franja y a la altura del breadcrumb, y SHALL estar presente en todos los estados de la vista (cargando, con error, con prefacturas y sin personas externas). Las acciones SHALL conservar sus condiciones de habilitado actuales: "Generar el esperado del mes" sólo con filas sin esperado generado, "Registrar prefactura" sólo con alguna prefactura por registrar, y ambas deshabilitadas mientras el período carga.

#### Scenario: Controles en la franja del breadcrumb
- **WHEN** el usuario está en `/app/lead/facturacion`
- **THEN** el navegador de período y los botones "Generar el esperado del mes" y "Registrar prefactura" aparecen en la franja del breadcrumb, a la derecha, en ese orden
- **AND** no aparece ningún selector desplegable con etiqueta "Período" en el contenido

#### Scenario: Generar desde la franja
- **WHEN** el período tiene filas sin esperado generado y el usuario pulsa "Generar el esperado del mes" en la franja
- **THEN** se genera el esperado del período visible y se muestra la confirmación, igual que antes de este cambio
- **AND** el botón queda deshabilitado cuando ya no queda nada por generar

#### Scenario: Registrar desde la franja
- **WHEN** el período tiene alguna prefactura por registrar y el usuario pulsa "Registrar prefactura" en la franja
- **THEN** se abre el formulario de registro de prefactura, igual que antes de este cambio

#### Scenario: Controles presentes durante la carga o el error
- **WHEN** el período está cargando o muestra un error de carga
- **THEN** el navegador de período y los dos botones siguen presentes en la franja del breadcrumb, con los botones deshabilitados mientras dura la carga

#### Scenario: Salir de la vista
- **WHEN** el usuario navega al detalle de una prefactura o a otro módulo
- **THEN** el navegador de período y los dos botones dejan de mostrarse en la franja del breadcrumb

### Requirement: El navegador de período recorre el mes en curso y los cinco anteriores
El navegador SHALL anunciar el mes visible con su nombre e inicial mayúscula seguido del año (por ejemplo "Agosto 2026"). SHALL permitir ir al mes anterior y al mes siguiente de uno en uno, dentro del rango formado por el mes en curso y los cinco meses anteriores: "Mes siguiente" SHALL estar deshabilitado cuando el mes visible es el mes en curso, y "Mes anterior" SHALL estar deshabilitado cuando el mes visible es el más antiguo del rango. Al cambiar de mes, todo lo que la vista muestra (cards y tabla) SHALL pasar a ese mes.

#### Scenario: Ir al mes anterior
- **WHEN** el mes visible es el mes en curso y el usuario pulsa "Mes anterior"
- **THEN** el navegador anuncia el mes anterior, las cards nombran ese mes y la tabla muestra sus prefacturas
- **AND** "Mes siguiente" pasa a estar habilitado

#### Scenario: Mes en curso sin mes siguiente
- **WHEN** el mes visible es el mes en curso
- **THEN** "Mes siguiente" está deshabilitado y "Mes anterior" habilitado

#### Scenario: Extremo antiguo del rango
- **WHEN** el mes visible es el quinto mes anterior al mes en curso
- **THEN** "Mes anterior" está deshabilitado y "Mes siguiente" habilitado

### Requirement: El mes visible vive en la dirección de la pantalla
El mes visible SHALL quedar registrado en la dirección de la pantalla como `?period=YYYY-MM`, sin parámetro cuando es el mes en curso, de modo que un enlace compartido o una recarga abran el mismo mes. Un valor con formato inválido SHALL caer al mes en curso sin error.

#### Scenario: Cambiar de mes actualiza la dirección
- **WHEN** el usuario pasa del mes en curso al anterior con el navegador
- **THEN** la dirección incorpora `?period=` con ese mes
- **AND** al volver al mes en curso el parámetro desaparece

#### Scenario: Abrir un enlace con período
- **WHEN** el usuario abre `/app/lead/facturacion?period=YYYY-MM` con un mes del rango
- **THEN** el navegador anuncia ese mes y las cards y la tabla lo muestran

#### Scenario: Período inválido en la dirección
- **WHEN** la dirección trae un `?period=` que no tiene la forma `YYYY-MM`
- **THEN** la vista abre en el mes en curso

### Requirement: La vista usa un espaciado vertical uniforme
El espacio entre los bloques del contenido (resumen y tabla) y entre las cards del resumen SHALL ser el mismo: 12px (`gap-3`), no 24px (`gap-6`) entre bloques ni 16px (`gap-4`) entre cards, de modo que la pantalla se lea con un solo ritmo y entren más filas en el primer pantallazo.

#### Scenario: Separación entre resumen y tabla
- **WHEN** la vista muestra las cards del período y la tabla
- **THEN** la separación vertical entre ambos bloques es de 12px
- **AND** la separación horizontal entre las cards del resumen también es de 12px

### Requirement: La tabla ofrece búsqueda y paginación en su propia card
La tabla de prefacturas SHALL mostrar en su barra un campo de búsqueda que acote las filas por persona, proveedor o célula/CoE (sin distinguir mayúsculas), junto al filtro por proveedor, y SHALL paginar las filas visibles desde el pie de la misma card con el selector de tamaño de página (10, 20, 50). La búsqueda y la paginación operan sobre las filas del período ya cargadas, sin nueva petición. Cambiar la búsqueda, el filtro, el tamaño de página o el período SHALL volver a la primera página.

#### Scenario: Buscar por persona
- **WHEN** el usuario escribe parte del nombre de una persona en la búsqueda
- **THEN** la tabla muestra sólo las filas cuya persona, proveedor o célula contienen ese texto
- **AND** la paginación cuenta sólo esas filas

#### Scenario: Sin coincidencias
- **WHEN** la búsqueda o el filtro de proveedor no coinciden con ninguna fila
- **THEN** bajo las cabeceras se lee "Sin resultados" invitando a ajustarlos, la barra conserva lo escrito y no se muestra la paginación
- **AND** no se muestra el estado "No hay personas externas", reservado al período sin filas y sin búsqueda ni filtro

#### Scenario: Paginar
- **WHEN** el período tiene más filas que el tamaño de página
- **THEN** el pie muestra el rango visible ("Mostrando 1–10 de N"), el selector de tamaño y los controles de página
