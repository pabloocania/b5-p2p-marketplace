#!/bin/bash

# Script para verificar que los meta tags de Open Graph estén correctos después del deploy

echo "🔍 Verificando meta tags de Open Graph para kioscoin.com..."
echo ""

URL="https://www.kioscoin.com"

echo "1. Verificando que la imagen og-image.png sea accesible..."
IMAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${URL}/og-image.png")
if [ "$IMAGE_STATUS" -eq 200 ]; then
    echo "   ✅ Imagen accesible (HTTP $IMAGE_STATUS)"
else
    echo "   ❌ Imagen NO accesible (HTTP $IMAGE_STATUS)"
fi

echo ""
echo "2. Verificando meta tags en el HTML..."
HTML=$(curl -s "$URL")

# Verificar meta tags críticos
MISSING_TAGS=()

if echo "$HTML" | grep -q 'property="og:title"'; then
    OG_TITLE=$(echo "$HTML" | grep -o 'property="og:title"[^>]*content="[^"]*"' | sed 's/.*content="\([^"]*\)".*/\1/')
    echo "   ✅ og:title encontrado: $OG_TITLE"
else
    echo "   ❌ og:title NO encontrado"
    MISSING_TAGS+=("og:title")
fi

if echo "$HTML" | grep -q 'property="og:image"'; then
    OG_IMAGE=$(echo "$HTML" | grep -o 'property="og:image"[^>]*content="[^"]*"' | sed 's/.*content="\([^"]*\)".*/\1/')
    echo "   ✅ og:image encontrado: $OG_IMAGE"
    if [[ "$OG_IMAGE" == *"og-image.png"* ]]; then
        echo "   ✅ URL de imagen correcta"
    else
        echo "   ⚠️  URL de imagen puede ser incorrecta"
    fi
else
    echo "   ❌ og:image NO encontrado"
    MISSING_TAGS+=("og:image")
fi

if echo "$HTML" | grep -q 'property="og:description"'; then
    echo "   ✅ og:description encontrado"
else
    echo "   ❌ og:description NO encontrado"
    MISSING_TAGS+=("og:description")
fi

if echo "$HTML" | grep -q 'property="og:image:width" content="1200"'; then
    echo "   ✅ og:image:width correcto (1200)"
else
    echo "   ❌ og:image:width incorrecto o faltante"
    MISSING_TAGS+=("og:image:width")
fi

if echo "$HTML" | grep -q 'property="og:image:height" content="630"'; then
    echo "   ✅ og:image:height correcto (630)"
else
    echo "   ❌ og:image:height incorrecto o faltante"
    MISSING_TAGS+=("og:image:height")
fi

echo ""
if [ ${#MISSING_TAGS[@]} -eq 0 ]; then
    echo "✅ Todos los meta tags críticos están presentes"
    echo ""
    echo "📋 Próximos pasos:"
    echo "   1. Ve a https://developers.facebook.com/tools/debug/"
    echo "   2. Pega: $URL"
    echo "   3. Click en 'Scrape Again' (varias veces)"
    echo "   4. Verifica el preview"
    echo "   5. Prueba en WhatsApp"
else
    echo "❌ Faltan los siguientes meta tags:"
    for tag in "${MISSING_TAGS[@]}"; do
        echo "   - $tag"
    done
fi

echo ""
echo "🔗 Enlaces útiles:"
echo "   - Facebook Debugger: https://developers.facebook.com/tools/debug/"
echo "   - Open Graph Debugger: https://www.opengraph.xyz/"
echo "   - LinkedIn Inspector: https://www.linkedin.com/post-inspector/"

