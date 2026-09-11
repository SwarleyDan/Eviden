# Modelo de datos v0.2

## Cadena de confianza

`SOURCE → SOURCE_VERSION → EVIDENCE → STRUCTURED DATA → RULE → CALCULATION → RESULT`

## Entidades

- `Jurisdiction`: país, estado y municipio.
- `Procedure`: trámite o servicio.
- `Requirement`: requisito y condición de aplicabilidad.
- `Classification`: clasificación habitacional.
- `ClassificationRule`: parámetro normativo.
- `Fee`: importe y unidad de cobro.
- `FeeRule`: fórmula o condición de cálculo.
- `Source`: documento o ficha oficial.
- `SourceVersion`: versión temporal de una fuente.
- `Evidence`: referencia verificable que respalda un dato.
- `Instrument`: ley, reglamento, programa o norma aplicable.

## Decisiones

1. Los componentes de UI no contienen tarifas.
2. Los cálculos son deterministas.
3. Un importe sin evidencia no entra al motor.
4. Una inferencia de compatibilidad nunca se etiqueta como determinación oficial.
5. Las fuentes operativas (RUTS) y las fuentes normativas primarias se almacenan por separado.
6. Las discrepancias se documentan explícitamente.
