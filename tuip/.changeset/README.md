# Changesets

Este directorio versiona `@tuya-ui/components`. Cada PR que cambia su comportamiento observable debe agregar un changeset:

```bash
pnpm changeset
```

Elegí `@tuya-ui/components` cuando el CLI pregunte qué paquete cambió, el tipo de bump (`patch`/`minor`/`major` según la Requirement "Versionado semántico del paquete" en `openspec/specs/component-library-publishing/spec.md`), y describí el cambio en términos que un consumidor entienda — ese texto se vuelca directo al changelog publicado.

Ver [changesets/changesets](https://github.com/changesets/changesets) para la documentación completa del formato.
