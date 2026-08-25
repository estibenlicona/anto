## 1. Sidebar de Admin

- [x] 1.1 En `frontend/src/features/admin-shell/navigation.ts`, acortar las entradas a `Inicio`, `Sprints`, `Parámetros` e `Ingesta`.
- [x] 1.2 Acortar el rótulo de grupo `Integración DevOps` a `DevOps`; `Configuración` ya es de una palabra y queda igual.
- [x] 1.3 NO tocar `adminRouteTitles`: es el otro extremo del reparto y tiene que seguir con el nombre largo.
- [x] 1.4 Confirmar que no cambian los ids de navegación ni las rutas, sólo el texto visible.

## 2. Sidebar de Chapter Lead

- [x] 2.1 En `frontend/src/features/chapter-lead-shell/navigation.ts`, acortar las entradas a `Inicio` y `Células`.
- [x] 2.2 Acortar el rótulo de grupo `Gestión de Capacidad` a `Capacidad`.
- [x] 2.3 NO tocar `leadRouteTitles`, por el mismo motivo que en Admin. CORREGIDO: `leadRouteTitles` del inicio decía "Inicio", no el nombre largo. Con el menú acortado, "Torre de control" habría desaparecido de la app y el escenario "el nombre completo no se pierde" habría quedado falso. Se pasó a "Torre de control"; su par de Admin ya funcionaba así.

## 3. Pestañas de Parámetros del modelo

- [x] 3.1 En `AdminParametersPage.tsx`, acortar los rótulos a `Bandas`, `Capacidades`, `Preguntas` y `Versionado`.
- [x] 3.2 Conservar los `value` de cada pestaña: son identificadores, no texto visible.

## 4. Navbar

- [x] 4.1 Revisar los rótulos del Navbar en ambos layouts y confirmar que no hay nada que acortar — se espera que no lo haya. Si aparece algo de más de dos palabras que sea una etiqueta de navegación, acortarlo; el nombre del producto queda fuera por ser identidad de marca. Revisado: `Ayuda`, `Cerrar sesión` y `Plataforma` ya son cortos; `name`/`role`/`product` son identidad, no etiquetas de navegación. Sin cambios, como se esperaba.

## 5. Pruebas

- [x] 5.1 Actualizar `AdminLayout.test.tsx` y `ChapterLeadLayout.test.tsx`, que buscan entradas de navegación por su texto.
- [x] 5.2 Actualizar `AdminParametersPage.test.tsx`, que selecciona pestañas por su nombre accesible.
- [x] 5.3 Revisar `AdminHomePage.test.tsx` y `AdminSprintsPage.test.tsx`, que también mencionan alguno de estos textos, y ajustar sólo lo que se refiera al menú y no al título de la pantalla.
- [x] 5.4 Agregar un caso que verifique que el breadcrumb sigue mostrando el nombre completo mientras el menú muestra el corto — es lo que impide que alguien "simplifique" también los `RouteTitles`.

## 6. Verificación

- [x] 6.1 Recorrer los dos shells y confirmar que cada entrada activa se sigue marcando y que ninguna etiqueta quedó ambigua entre sí.
- [x] 6.2 Confirmar en Parámetros que las cuatro pestañas entran holgadas y que las acciones de bandas siguen apareciendo sólo con su sección activa.
- [x] 6.3 Confirmar que el breadcrumb de cada pantalla sigue diciendo el nombre completo.
- [x] 6.4 Correr `tsc --noEmit` y la suite del frontend; los únicos fallos esperados son los dos preexistentes (`App.test.tsx` y `httpClient.test.ts`).
