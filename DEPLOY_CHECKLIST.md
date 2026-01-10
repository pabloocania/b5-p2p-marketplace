# ✅ Checklist de Deploy - Open Graph para WhatsApp

## Antes de hacer push:

- [x] Imagen `og-image.png` existe en `/public/og-image.png`
- [x] Imagen tiene dimensiones exactas: **1200x630px**
- [x] Imagen pesa menos de 500KB (idealmente < 200KB)
- [x] Meta tags configurados en `pages/_document.tsx`
- [x] Build compila sin errores (`npm run build`)

## Después del deploy en Vercel:

### 1. Verificar que la imagen sea accesible
```bash
curl -I https://www.kioscoin.com/og-image.png
# Debe retornar: HTTP/2 200
```

O ejecuta el script de verificación:
```bash
./verify-og-tags.sh
```

### 2. Verificar HTML generado
Abre en el navegador y ve el código fuente (View Source):
```
https://www.kioscoin.com
```

Busca en el `<head>`:
- ✅ `<meta property="og:title" content="Kioscoin - P2P Stablecoin Market" />`
- ✅ `<meta property="og:image" content="https://www.kioscoin.com/og-image.png" />`
- ✅ `<meta property="og:image:width" content="1200" />`
- ✅ `<meta property="og:image:height" content="630" />`

### 3. Limpiar Cache de Facebook/WhatsApp (OBLIGATORIO)

**Paso crítico:** WhatsApp usa el cache de Facebook, DEBES limpiarlo:

1. Ve a: **https://developers.facebook.com/tools/debug/**
2. Pega: `https://www.kioscoin.com`
3. Click en **"Scrape Again"** (hazlo 2-3 veces)
4. Verifica que aparezca:
   - ✅ Preview con imagen (1200x630px)
   - ✅ Título: "Kioscoin - P2P Stablecoin Market"
   - ✅ Descripción completa
   - ✅ Sin errores de imagen

### 4. Probar en WhatsApp

**IMPORTANTE:** Espera 5-10 minutos después de limpiar el cache en Facebook Debugger.

1. Abre WhatsApp (móvil o desktop)
2. Pega el link: `https://www.kioscoin.com`
3. Espera 10-15 segundos
4. Debe aparecer preview completo con:
   - ✅ Imagen grande (no pequeño cuadradito)
   - ✅ Título visible
   - ✅ Descripción visible
   - ✅ URL del sitio

### 5. Si NO funciona después de limpiar cache:

**Opción A: Espera más tiempo**
- El cache de WhatsApp puede tardar hasta 30 minutos en actualizar
- Intenta compartir en un chat diferente (nuevo)

**Opción B: Verifica errores**
- Ve a Facebook Debugger de nuevo
- Revisa si hay errores en la sección "Warnings That Should Be Fixed"
- Asegúrate de que la imagen sea accesible (no 404)

**Opción C: Verifica dimensiones de imagen**
```bash
# Después del deploy, verifica dimensiones:
curl -s https://www.kioscoin.com/og-image.png | file -
# Debe mostrar: PNG image data, 1200 x 630
```

## Comparación con bwin.com

bwin.com funciona porque:
- ✅ Imagen optimizada (1200x630px)
- ✅ Meta tags correctos
- ✅ Cache ya limpio
- ✅ HTML inicial tiene los meta tags (no dependen de JS)

Tu sitio ahora tiene todo lo mismo. Después de limpiar el cache, debería funcionar igual.

## Archivos modificados en este fix:

1. ✅ `public/og-image.png` - Redimensionada a 1200x630px
2. ✅ `pages/_document.tsx` - Meta tags optimizados
3. ✅ `pages/_app.tsx` - Meta tags duplicados para asegurar disponibilidad
4. ✅ `next.config.js` - Headers para imágenes
5. ✅ `verify-og-tags.sh` - Script de verificación
6. ✅ `DEPLOY_CHECKLIST.md` - Este checklist

## Notas finales:

- 🚨 **Cache es el problema #1:** Siempre limpia el cache en Facebook Debugger
- ⏱️ **Tiempo de espera:** Después de limpiar cache, espera 5-30 minutos
- 🔄 **Reintentos:** Si no funciona, limpia cache varias veces y prueba en chats nuevos
- ✅ **Verificación:** Usa el script `verify-og-tags.sh` para verificar rápidamente

