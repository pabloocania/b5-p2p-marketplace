# Instrucciones para la Imagen Open Graph

## Estado Actual

✅ Los meta tags de Open Graph están configurados correctamente en `pages/_document.tsx`
✅ Se ha creado una imagen temporal `public/og-image.png` (copiada de kioscoin-imagotipo.png)

## Imagen Open Graph Requerida

Para que los previews de WhatsApp, Facebook y Twitter funcionen correctamente, necesitas crear una imagen optimizada:

### Especificaciones:
- **Tamaño:** 1200x630 píxeles (ratio 1.91:1)
- **Formato:** PNG o JPG
- **Tamaño de archivo:** Máximo 1MB (recomendado < 300KB)
- **Ubicación:** `/public/og-image.png`
- **Contenido sugerido:**
  - Logo de Kioscoin
  - Título: "Kioscoin - P2P Stablecoin Market"
  - Descripción breve o tagline
  - Colores de marca (#3e2262)

### Herramientas para crear la imagen:
1. **Figma** - Diseño profesional
2. **Canva** - Plantillas de Open Graph
3. **Photoshop/GIMP** - Edición de imágenes
4. **Online tools:**
   - https://www.opengraph.xyz/ (generador de preview)
   - https://metatags.io/ (generador de meta tags con imagen)

### Reemplazar la imagen temporal:
```bash
# Reemplaza la imagen actual con tu versión final
cp tu-imagen-og.png public/og-image.png
```

## Verificación

Después de crear y subir la imagen:

1. **Verificar que la imagen es accesible:**
   ```
   https://www.kioscoin.com/og-image.png
   ```

2. **Probar con Facebook Debugger:**
   - Ve a: https://developers.facebook.com/tools/debug/
   - Pega: `https://www.kioscoin.com`
   - Click en "Scrape Again"
   - Verifica que la imagen se carga correctamente

3. **Probar con Open Graph Debugger:**
   - Ve a: https://www.opengraph.xyz/
   - Pega: `https://www.kioscoin.com`
   - Verifica el preview

4. **Probar en WhatsApp:**
   - Comparte el link en un chat
   - Debe mostrar el preview con título, descripción e imagen

## Notas Importantes

- ⚠️ **Cache:** Las plataformas sociales cachean las imágenes. Si cambias la imagen, usa los debuggers para refrescar el cache.
- ✅ **URLs absolutas:** Todos los meta tags usan URLs absolutas con `https://www.kioscoin.com`
- ✅ **Multiidioma:** Los meta tags incluyen `og:locale:alternate` para español e inglés
- ✅ **SSR:** Los meta tags están en `_document.tsx` para que estén en el HTML inicial (importante para scrapers)

