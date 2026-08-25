---
"@tuya-ui/components": patch
---

`OptionCard`: el punto del radio ahora se rellena al seleccionar la tarjeta. El elemento llevaba `border-default` fijo junto al `border-[6px]` condicional; como `cn` no deduplica utilidades, en el stylesheet ganaba `border-default` (va después) y el radio se veía vacío aunque `aria-checked` fuera `true`. El ancho del borde vive ahora completo en cada rama.
