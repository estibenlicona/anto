## 1. La regla, antes que el valor

- [x] 1.1 Cambiar en `verify-tokens.ts` el piso de `sky`: deja de medirse contra fila, lienzo y fila seleccionada, y pasa a medirse contra el segmento vacío del medidor de nivel. Los otros tres matices no cambian.
- [x] 1.2 Hacerlo **antes** de tocar el valor. Al revés, el build queda roto entre un paso y el otro y la tentación es apagar la comprobación para avanzar.
- [x] 1.3 Pruebas: el verificador falla si `sky` se aclara más allá de su piso nuevo, y sigue fallando si cualquiera de los otros tres baja de 3:1. La primera es la que importa: es la que demuestra que la excepción se comprueba y no se apagó.

## 2. El valor

- [x] 2.1 Elegir el claro de `sky` de modo que se lea como el primer paso de la progresión —visiblemente más leve que `blue`— y siga distinguiéndose de un segmento vacío. Medir, no estimar.
- [x] 2.2 Reescribir el comentario de `accent-colors.ts` que hoy dice que `sky` es el celeste bajado hasta pasar el piso: pasa a decir cuál es su piso, por qué es ése, y qué tiene que hacer una pieza que quiera usar el acento como único portador de una distinción.
- [x] 2.3 Actualizar la tabla de ratios del comentario, incluida la nota de que `sky` era el más ajustado: deja de serlo porque deja de medirse igual.

## 3. Cierre

- [x] 3.1 Build del paquete de tokens y del de componentes sin errores, con el verificador corriendo.

## 4. Verificación

- [x] 4.1 Publicar y reinstalar en la aplicación. Recordar que reinstalar sin subir versión conserva el hash de dependencia de Vite: **hace falta un puerto nuevo** para que suelte el `?v=` viejo.
- [x] 4.2 En el listado de Personas, mirar la columna de seniority: Principiante tiene que leerse claramente más leve que Competente, y su segmento lleno tiene que seguir distinguiéndose de los vacíos.
- [x] 4.3 Mirar también el tema oscuro, que este change no toca, para confirmar que no se movió.
