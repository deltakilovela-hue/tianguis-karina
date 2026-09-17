# Notas de revisión del catálogo

## Resumen
- **Productos generados:** 99
- **Imágenes totales usadas:** 113 de 113 (verificado con script, sin duplicados ni faltantes)
- Todo el texto (títulos, descripciones, tallas estimadas) es **placeholder generado por IA** para poder armar y visualizar el sitio. Karina debe reemplazarlo con la información real antes de publicar, especialmente precios, tallas exactas y nombres de marca.

## Cómo se agruparon las fotos
La numeración consecutiva de archivo se usó como pista principal (misma prenda = mismo gancho/pared, fotografiada 1-3 veces seguidas). Casos agrupados en más de una imagen:
- `IMG_0053/0054/0055` → lote de figuras y dinosaurios (mismo montón, 3 tomas casi idénticas, tratado como 1 solo producto).
- `IMG_1837/1838` → mismo pantalón caqui de niño.
- `IMG_1864/1865` → misma cortina blanca de encaje.
- `IMG_1866/1867` → misma tela/cortina gris lisa.
- `IMG_1871/1872` → misma prenda floral negra, fotografiada abierta y luego "acomodada" como vestido (ver caso ambiguo abajo).
- `IMG_1876/1877` → misma playera gris Disney.
- `IMG_1911/1912` → mismo vestido largo satinado turquesa.
- `IMG_1920/1921` → mismo jumpsuit de rayas azul/blanco.
- `IMG_1924/1925` → mismo top negro espalda descubierta.
- `IMG_1937/1938/1939` → mismo lote de juguetes de playa (3 ángulos).
- `IMG_1942/1943` → mismo juguete tipo Poké Ball (cerrado y abierto).
- `IMG_1944/1945` → misma tina de baño rosa Prinsel.

Todas las demás imágenes (89 fotos) quedaron como productos de una sola imagen porque, al revisarlas una por una, correspondían a prendas/artículos claramente distintos entre sí (cambiaba tipo de prenda, color o estampado aunque compartieran fondo/gancho).

## Casos ambiguos o que vale la pena confirmar

1. **`IMG_1871` / `IMG_1872` (kimono floral negro):** no estoy 100% seguro de si es la misma prenda fotografiada dos veces (abierta y "armada" como vestido) o si en realidad son dos piezas de un set (kimono + vestido/short a juego). Las traté como un solo producto. Confirmar antes de publicar.

2. **Números en los ganchos ("5", "6", "10", "12"):** aparecen repetidamente en las etiquetas de los ganchos de ropa. Parecen ser **números de organización de tienda/rack**, no necesariamente la talla real de la prenda. Usé estos números solo como referencia aproximada para estimar "niño/niña" vs "juvenil/dama", pero **las tallas en el JSON son estimadas por proporción visual, no datos reales** — hay que revisarlas contra la etiqueta interna de cada prenda.

3. **Marcas "RCBPC" (`IMG_1827`), "Yorkiler" (`IMG_1891`) y similares:** se ven logos/textos en las etiquetas pero no corresponden a marcas reconocidas, así que se dejaron como `brand: null` en vez de inventar. Si Karina reconoce la marca real, puede agregarla.

4. **Bikini negro con dije de sol (`IMG_1936`):** la foto muestra lo que parecen ser **3 piezas** colgadas juntas (dos tops tipo bandeau + una parte inferior). Podría tratarse de un solo set intercambiable o de dos bikinis distintos fotografiados juntos por error. Se catalogó como un solo producto; revisar si en realidad son 2 traje de baño diferentes.

5. **Juguete "Poké Ball" (`IMG_1942/1943`):** es claramente un juguete estilo Poké Ball con discos intercambiables, pero no se ve ningún logo impreso de "Pokémon" en las fotos, así que se dejó `brand: null` para no inventar una licencia oficial no confirmada.

6. **Disfraz de Thor (`IMG_0052`):** no se detectó ningún texto de marca (Marvel, Rubie's, etc.) legible en las fotos, así que se dejó `brand: null` aunque el diseño es evidentemente de Thor/Marvel.

7. **Playera "Stranger Things" (`IMG_1949`):** la etiqueta interior dice talla "M/M" (adulto/unisex). Se categorizó como `ropa_caballero` por defecto, pero es una playera gráfica unisex que Karina podría preferir mover a otra categoría según su catálogo.

8. **Ropa para adulto vs. niño/juvenil:** varias prendas de mezclilla y pantalones para "dama" o "caballero" no tienen etiqueta de talla visible en la foto; las tallas puestas (ej. "Dama S/M", "Caballero 34") son solo estimaciones por proporción y silueta en las fotos, no datos confirmados.

## Marcas reales detectadas y confirmadas en fotos (legibles)
Estas sí se ven claramente en las etiquetas/logos y se dejaron en el JSON:
- **American Eagle Outfitters** (3 prendas de mezclilla distintas)
- **Levi's** (1 jeans de caballero)
- **Polo Club** (4 camisas de caballero)
- **Disney** (playera y vestido con Mickey/Donald/Goofy)
- **Star Wars** (playera y bolsa de Baby Yoda)
- **Gap** (camisa azul claro de niño)
- **SHEIN** (blusa verde)
- **Wilson** (pants deportivo)
- **Naruto** (playera con licencia)
- **Hang Ten** (playera surf)
- **Mainstays** (organizador plástico)
- **Prinsel** (tina de bebé)
- **Marvel Avengers** (peluche Rocket Raccoon, texto parcial "AVE..." visible en la etiqueta)

## Siguientes pasos sugeridos para Karina
1. Revisar los 8 casos ambiguos listados arriba.
2. Reemplazar tallas estimadas por las tallas reales de cada etiqueta.
3. Confirmar/ajustar precios según su criterio real de venta.
4. Revisar los títulos y descripciones generados y ajustarlos a su tono de venta preferido.
