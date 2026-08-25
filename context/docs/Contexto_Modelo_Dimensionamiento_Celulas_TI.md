# Modelo de Dimensionamiento Temprano de Células TI

## Problema identificado

Actualmente, cuando nace una iniciativa, la organización necesita definir:

- Cuántas personas conformarán la célula.
- Qué perfiles se requieren.
- Qué capacidades son necesarias.
- Qué nivel de experiencia debe tener cada perfil.

Todo esto ocurre antes de contar con:

- Arquitectura detallada.
- Historias de usuario.
- Backlog refinado.
- Estimaciones detalladas.

Por lo tanto, los modelos tradicionales de estimación detallada no son suficientes en esta etapa.

---

# Preguntas que el modelo debe responder

| Pregunta | Herramienta principal |
|-----------|----------------------|
| ¿Qué capacidades necesito? | Análisis de iniciativa + SFIA |
| ¿A qué nivel necesito esas capacidades? | SFIA |
| ¿Cuánto trabajo hay? | COCOMO / Estimación |
| ¿Cuántas personas necesito? | Capacity Planning |
| ¿Cómo debería organizar el equipo? | Team Topologies |

---

# Conclusiones sobre SFIA

SFIA NO responde:

- Cuántas personas necesito.
- Cuántos arquitectos necesito.
- Cuántos desarrolladores necesito.

SFIA SÍ responde:

- Qué capacidades se requieren.
- Qué nivel de responsabilidad debe tener cada capacidad.

Ejemplo:

| Capability | Nivel SFIA |
|------------|------------|
| Arquitectura | 5 |
| Seguridad | 4 |
| Testing | 3 |

SFIA describe la calidad y profundidad requerida, no la cantidad.

---

# Limitaciones de SFIA

SFIA no determina:

- FTE.
- Staffing.
- Tamaño de célula.
- Cantidad de personas.

Para eso se requiere un modelo complementario de Capacity Planning.

---

# Descubrimiento importante

El problema principal de la organización no es SFIA.

El problema es:

"¿Cómo dimensionar una célula cuando apenas existe una idea de negocio?"

---

# Evaluación de alternativas

## COCOMO

Ventajas:

- Estima esfuerzo.
- Estima costo.
- Estima duración.

Problema:

Requiere tamaño aproximado:

- KLOC.
- Function Points.
- Casos de uso.
- Story Points.

Información que normalmente no existe cuando nace una iniciativa.

---

## T-Shirt Sizing

Ventajas:

- Funciona con poca información.
- Permite clasificar iniciativas tempranamente.
- Facilita decisiones de portafolio.

Por ello se concluyó que:

T-Shirt Sizing es más adecuado para la etapa inicial.

COCOMO puede utilizarse posteriormente cuando exista mayor detalle.

---

# Modelo objetivo

## Flujo general

Idea
↓
Clasificación de complejidad
↓
Talla (XS/S/M/L/XL)
↓
Esfuerzo esperado
↓
FTE sugeridos
↓
Capacidades requeridas
↓
Nivel SFIA requerido
↓
Conformación de la célula

---

# Modelo de Scoring

Se acordó construir un formulario con preguntas.

Las respuestas generan puntaje.

El puntaje genera una talla.

La talla genera recomendaciones.

---

# Categorías identificadas

## Negocio

Ejemplos:

- Impacto en clientes.
- Impacto regulatorio.
- Procesos financieros afectados.

## Integraciones

Ejemplos:

- Sistemas internos.
- Terceros.
- APIs.
- Dependencias externas.

## Seguridad

Ejemplos:

- Datos sensibles.
- Información financiera.
- Exposición a internet.
- Riesgo de fraude.

## Tecnología

Ejemplos:

- Tecnología nueva.
- Complejidad técnica.
- Tiempo real.

## Operación

Ejemplos:

- Disponibilidad requerida.
- Observabilidad.
- Soporte.

---

# Regla importante descubierta

Preguntas cuantitativas deben tener respuestas cuantitativas.

Ejemplo correcto:

¿Cuántos sistemas internos deben integrarse o modificarse?

Opciones:

- 0
- 1-2
- 3-5
- 6-10
- Más de 10

Ejemplo incorrecto:

- Bajo
- Medio
- Alto

---

# Tipos de preguntas

## Tipo A - Objetivas

Se responden con cantidades.

Ejemplos:

- ¿Cuántos sistemas?
- ¿Cuántas áreas?
- ¿Cuántos proveedores?
- ¿Cuántos canales?

## Tipo B - Evaluativas

Se responden con juicio experto.

Ejemplos:

- Sensibilidad de datos.
- Criticidad.
- Riesgo operativo.

Escala sugerida:

- No aplica
- Bajo
- Medio
- Alto
- Crítico

---

# Tiempo objetivo

Conclusión importante:

El tiempo objetivo NO debe modificar la talla.

Ejemplo:

Una iniciativa sigue siendo L aunque deba salir en 3 meses o en 12 meses.

Lo que cambia es la capacidad necesaria.

Por tanto:

Talla
↓
PM estimados
↓
Tiempo objetivo
↓
FTE sugeridos

No:

Tiempo objetivo
↓
Aumentar complejidad

---

# Capacity Planning

Conclusión obtenida:

Al inicio no existen históricos.

Por lo tanto:

Las primeras reglas deben construirse usando criterio experto.

Posteriormente se calibran con datos reales.

Evolución esperada:

Opinión experta
↓
Reglas iniciales
↓
Captura de métricas
↓
Calibración
↓
Modelo basado en evidencia

---

# Riesgos identificados

## Subjetividad

Dos personas pueden clasificar diferente una misma iniciativa.

Mitigación:

- Preguntas objetivas.
- Reglas claras.
- Rangos definidos.

## Confundir esfuerzo con seniority

Mucho trabajo no significa más seniors.

Complejidad y volumen son variables distintas.

## Personas con múltiples capacidades

Una persona puede cubrir:

- Arquitectura.
- Seguridad.
- Performance.

El modelo debe contemplarlo.

## Disponibilidad real

0.5 FTE no significa necesariamente que exista esa capacidad disponible.

## Burocracia

Demasiadas preguntas vuelven el modelo difícil de usar.

---

# Modelo organizacional propuesto

## Entrada

Formulario de evaluación.

## Salida

1. Talla de la iniciativa.
2. Rango de PM.
3. FTE sugeridos.
4. Capacidades requeridas.
5. Nivel SFIA requerido.
6. Recomendación inicial de staffing.

---

# Visión futura

A medida que se acumulen iniciativas:

- Comparar estimado vs real.
- Ajustar pesos.
- Ajustar tallas.
- Ajustar FTE.
- Construir históricos.

Objetivo final:

Disponer de un modelo corporativo de dimensionamiento temprano de iniciativas y conformación de células TI basado en capacidades, complejidad y evidencia histórica.
