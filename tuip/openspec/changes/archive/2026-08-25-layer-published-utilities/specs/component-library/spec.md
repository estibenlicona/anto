## ADDED Requirements

### Requirement: La hoja publicada no le gana a las utilidades del consumidor
La hoja de estilos que el paquete publica SHALL emitir sus utilidades de modo que las que escribe el consumidor **manden sobre ellas**, sin que el consumidor tenga que declarar un orden de capas, ordenar sus importaciones ni marcar nada como importante.

El motivo es que las dos hojas conviven: el paquete distribuye utilidades ya compiladas y el consumidor compila las suyas. Entre utilidades la especificidad siempre empata, así que dentro de una misma capa decide el orden de aparición, y la hoja del paquete se importa después. Dentro de una sola hoja Tailwind ordena las variantes después de las utilidades base —por eso `w-full lg:w-80` funciona—; al concatenar dos hojas ese orden se pierde y la variante del consumidor deja de aplicarse.

El caso que SHALL quedar resuelto es el par (utilidad base publicada por el paquete, variante del consumidor sobre la misma propiedad): `w-full` contra `lg:w-80`, `flex-col` contra `md:flex-row`, `p-4` contra `lg:p-8`. Un consumidor SHALL poder escribir esos pares y obtener el comportamiento que Tailwind describe.

Las utilidades publicadas SHALL seguir por encima de la base y de los componentes del propio paquete: bajarlas por debajo de la capa base rompería toda utilidad que el paquete publique y el consumidor no compile —un `p-4` que ningún archivo del consumidor escribe— contra el reset universal que las aplicaciones suelen tener en base.

Esta condición SHALL vigilarse sobre la hoja publicada, porque su pérdida no produce ningún error: nada falla al compilar, ninguna prueba mira la cascada, y el síntoma aparece como una pantalla que se ve mal.

#### Scenario: Una variante del consumidor le gana a la utilidad base del paquete
- **WHEN** un consumidor escribe `w-full lg:w-80` en un elemento y mira la pantalla por encima del punto de corte `lg`
- **THEN** el elemento mide 20rem, y no el ancho completo

#### Scenario: Una utilidad que sólo publica el paquete sigue aplicándose
- **WHEN** el consumidor usa una clase que el paquete publica pero que su propio código no escribe en ninguna parte —así que su Tailwind no la genera— y su hoja tiene un reset universal en la capa base
- **THEN** la utilidad publicada se aplica igual, y no queda anulada por ese reset

#### Scenario: La condición se vigila sola
- **WHEN** la hoja publicada vuelve a emitir sus utilidades de forma que le ganen a las del consumidor
- **THEN** la verificación del paquete falla y lo dice, en vez de publicarse y aparecer como una pantalla desacomodada

#### Scenario: El consumidor no tiene que saber nada de esto
- **WHEN** un consumidor instala el paquete e importa su hoja después de la suya
- **THEN** no necesita declarar capas, reordenar importaciones ni usar `!important` para que sus utilidades manden
