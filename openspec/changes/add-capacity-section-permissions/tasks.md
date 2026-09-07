## 1. Semilla del directorio local

- [x] 1.1 Extender `host/scripts/entra-local-seed.mjs`: app registration "Gestión de Capacidad API" (`appIdUri: api://capacidad`, scope `access_as_user`), los 12 app roles `Capacidad.*` con tipo `User`, y asignaciones — Ana los 12; Tomás `Iniciativas`, `Celulas`, `Personas`, `Ausencias`, `Dedicacion`, `Prefacturacion`, `Competencias`; Lucía `Iniciativas`, `Celulas`, `Dedicacion`, `Competencias`; Rita ninguno. La salida agrega el scope sugerido para `VITE_ENTRA_API_SCOPES`. Verificar: dos ejecuciones seguidas terminan en 0 con las mismas cantidades (2 apps, 15 roles, 4 personas, asignaciones estables), corriendo sobre el directorio ya sembrado sin duplicar nada.
- [x] 1.2 Verificar los sub-claims con la vista previa del emulador: `POST /admin/api/apps/<api-gc>/token-preview` (accessToken) para Lucía trae `roles` = `["Capacidad.Celulas","Capacidad.Competencias","Capacidad.Dedicacion","Capacidad.Iniciativas"]`, y para Rita no trae `roles`; el ID token del host de Lucía sigue trayendo sólo `Plataforma.TechLead`. Verificar: las tres respuestas con `curl -k`.

## 2. Contrato de sesión del front

- [x] 2.1 `frontend/src/features/auth-session`: catálogo `CAPACITY_PERMISSIONS` + tipo `CapacityPermission`, `Session.permissions`, `mapCapacityRoles(roles: unknown)` (prefijo `Capacidad.`, desconocidos ignorados) y `hasPermission` en `deriveAuthSession`. Verificar con tests: mapeo de valores válidos, desconocido ignorado, `hasPermission` en sesión anónima siempre falso.
- [x] 2.2 Generalizar el filtro de navegación: `filterNav(groups, { hasRole, hasPermission })` con `permission?` por entrada y eliminación de grupos vacíos; `filterNavByRole` queda como alias deprecado. Verificar con tests: entrada sin permiso se oculta, entrada sin restricciones queda, grupo vacío desaparece, el alias sigue funcionando.
- [x] 2.3 Simulador del front (`src/dev/auth-simulator`): `capacityRoles` por perfil (admin 12; chapter-lead 7; nuevo "Chapter Lead acotado" sin `Prefacturacion` ni `Ausencias`; restricted vacío), pasados por `mapCapacityRoles`; el panel lista los permisos del perfil activo. Verificar con tests: elegir "Chapter Lead acotado" produce exactamente 5 permisos; el panel los muestra.

## 3. Shells por permiso

- [x] 3.1 `features/admin-shell/navigation.ts` + `features/chapter-lead-shell/navigation.ts`: mapa `SECTION_PERMISSION` por shell (sección → permiso) y `permission` en cada entrada salvo "Inicio"; los layouts pasan `hasPermission` al filtro. Verificar con tests de navegación: con todos los permisos se ven todas las entradas; sin `Capacidad.DevOps` desaparece "Ingesta" y el grupo "DevOps"; sin `Prefacturacion`/`Ausencias` desaparecen esas dos y el orden del resto se mantiene.
- [x] 3.2 Guard por permiso: `RequireRole` (o equivalente) acepta `permission?`; las rutas de sección de ambos shells lo declaran leyendo el mismo mapa `SECTION_PERMISSION`. Verificar con tests: con rol pero sin permiso la ruta muestra el aviso de permisos (no el login); test de coherencia que recorre las entradas del menú y comprueba que su ruta exige el mismo permiso.
- [x] 3.3 El badge de "Dedicación" no se calcula cuando la entrada está oculta. Verificar con test: perfil sin `Capacidad.Dedicacion` no dispara la consulta del badge.

## 4. Verificación

- [x] 4.1 `pnpm test` y `pnpm lint` de `frontend/` en verde (sin `pnpm install`; usar el `node_modules` existente). Verificar: ambos terminan en 0.
- [x] 4.2 Smoke con `pnpm dev:auth` del front: como Admin se ven las 6 entradas; como "Chapter Lead acotado" el menú no ofrece "Facturación" ni "Ausencias" y navegar directo a `/app/lead/facturacion` muestra el aviso de permisos; como Chapter Lead completo se ve todo su shell. Verificar: cada paso como se describe.
- [x] 4.3 Documentar en `frontend/README.md` (sección de sesión) y en `context/docs/Roles_y_Permisos_Plataforma.md` la resolución de R-06/permisos por sección: catálogo `Capacidad.*`, origen (app roles de la API de GC, claim `roles` del access token) y asignaciones de la semilla. Verificar: ambos documentos lo cuentan.
