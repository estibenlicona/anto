## REMOVED Requirements

### Requirement: Listado de componentes disponibles
**Reason**: El catálogo completo se instala de una vez con `npm install @tuya-ui/components`; ya no existe un subconjunto de componentes por agregar uno a uno que justifique un comando de listado.
**Migration**: Consultar el catálogo disponible en el sitio de documentación o en las exportaciones públicas de `@tuya-ui/components`.

### Requirement: Agregar componentes individualmente
**Reason**: Reemplazado por la instalación del paquete `@tuya-ui/components` (ver capability `component-library`); ya no se copia código fuente al repositorio del consumidor.
**Migration**: Ejecutar `npm install @tuya-ui/components` e importar el componente desde el paquete.

### Requirement: Resolución de dependencias entre componentes
**Reason**: Existía para copiar automáticamente los componentes internos de los que dependía un componente copiado. Al distribuirse como paquete compilado, esas dependencias internas se resuelven en el build del paquete, no en el proyecto del consumidor.
**Migration**: Ninguna acción del consumidor: las dependencias internas ya están resueltas dentro de `@tuya-ui/components`.

### Requirement: Prevención de sobrescritura accidental
**Reason**: Existía porque un componente ya copiado podía perder ediciones locales al agregarse de nuevo. Sin código copiado al repositorio del consumidor, no hay archivo de componente que el CLI pueda sobrescribir.
**Migration**: Ninguna acción del consumidor.

### Requirement: Contención de las escrituras dentro del proyecto
**Reason**: Protegía las escrituras de archivos de componente que el CLI generaba dentro del proyecto consumidor. Al no copiar código de componentes, esa superficie de escritura deja de existir.
**Migration**: Ninguna acción del consumidor.

### Requirement: Instalación global vía npm
**Reason**: El CLI `tuip` se retira por completo (ver design.md, Decisión 3): con el CSS de `@tuya-ui/components` autocontenido, no queda ninguna inicialización que un CLI deba resolver, así que no hay binario que instalar.
**Migration**: Instalar `@tuya-ui/components` con el gestor de paquetes del proyecto (`npm install @tuya-ui/components`), como cualquier otra dependencia.

### Requirement: Inicialización de proyecto consumidor
**Reason**: Existía para configurar Tailwind y los tokens en el proyecto consumidor antes de copiar componentes. `@tuya-ui/components` distribuye su propio CSS autocontenido (ver design.md, Decisión 1), así que no hay nada que inicializar en el proyecto consumidor.
**Migration**: Importar `@tuya-ui/components/styles.css` una vez en el proyecto; no se requiere configuración adicional de Tailwind ni de tokens.
