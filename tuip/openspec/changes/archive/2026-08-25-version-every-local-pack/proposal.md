## Why

Una pantalla de la aplicación dejó de cargar con este error:

> `SyntaxError: The requested module '/node_modules/.vite/deps/@tuya-ui_components.js?v=f53183e3' does not provide an export named 'PopoverAnchor'`

El export existía. Estaba en el paquete instalado, en sus tipos y en su bundle. Lo que fallaba era que Vite servía un **pre-bundle anterior a la reinstalación**, y el mensaje culpaba al componente en vez de a la caché. Alguien puede pasar horas buscando un bug que no está en el código.

La causa es el empaquetado. La aplicación instala tuip desde un tarball local:

```
"@tuya-ui/components": "file:../tuip/.local-packages/tuya-ui-components-0.1.0.tgz"
```

El nombre del archivo lleva la versión, y la versión **no cambia al reempacar**. Hoy la instalada y la del fuente son las dos `0.1.0`. Vite calcula el hash de su caché de dependencias a partir de la ruta resuelta y la versión del paquete: si las dos son idénticas, concluye —correctamente, dada la información que tiene— que no hay nada que reoptimizar, y sigue sirviendo lo viejo.

Ese es el patrón: **el sistema no falla, informa mal**. Un paquete que cambia de contenido sin cambiar de identidad le miente a todas las herramientas que usan la identidad para decidir si algo cambió, no sólo a Vite.

## What Changes

- **Empacar para consumo local incrementa la versión.** Cada tarball que la aplicación instala lleva una versión distinta del anterior, de modo que su nombre, la especificación de la dependencia y el hash de caché de quien lo consuma cambien con él.
- **El requisito de versionado deja de hablar sólo de publicar.** Hoy dice cómo versionar "una versión publicada"; pasa a cubrir también el empaquetado local, que es el que la aplicación consume de verdad y el único que hoy podía repetir versión.

### Fuera de alcance

- La caché de Vite en sí, que es de la aplicación y no de este paquete. Lo que cambia acá es dejar de darle motivos para equivocarse.
- Publicar a un registro remoto: sigue igual.
- Elegir la herramienta que hace el incremento; lo que este change fija es que **ocurra**.

## Capabilities

### Modified Capabilities

- `component-library-publishing`: el versionado semántico pasa a aplicarse también al empaquetado local, y una versión no se puede reutilizar con contenido distinto.

## Impact

- **Consumidores**: la aplicación va a ver cambiar la ruta del tarball en cada reinstalación, porque el nombre lleva la versión. Es el efecto buscado —es lo que invalida la caché— y hay que actualizar la dependencia con cada versión nueva.
- **Empaquetado**: `packages/components/package.json` y el paso que produce el tarball en `.local-packages`.
- **Lo que esto no arregla**: una caché ya envenenada. Quien tenga hoy el pre-bundle viejo tiene que borrarla o usar un puerto nuevo una última vez; a partir de ahí el problema deja de poder ocurrir.
- **Orden**: `component-library-publishing` está en `openspec/specs` y no tiene deltas pendientes.
