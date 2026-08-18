#!/bin/bash
#
# adapt_dump.sh — Adapta un dump de phpMyAdmin/MariaDB para usarlo como
# schema.sql en el pipeline de CI (GitHub Actions) de HebraTech.
#
# Qué hace:
#   1. Quita DEFINER=...@... y SQL SECURITY DEFINER de vistas (evita
#      errores de permisos al crear vistas en el contenedor MySQL del CI).
#   2. Antepone DROP DATABASE / CREATE DATABASE / USE para la base de test.
#   3. Por defecto, ELIMINA todas las filas de datos (INSERT INTO ...),
#      dejando solo estructura (CREATE TABLE + constraints). Esto evita
#      subir credenciales OAuth, tokens de sesión, contraseñas hasheadas
#      o emails reales al repo (GitHub Push Protection los bloquea, y
#      con razón). El CI solo necesita la estructura para correr tests.
#
# Uso:
#   ./adapt_dump.sh <archivo_dump.sql> [nombre_base_datos] [--con-datos]
#
# Ejemplo:
#   ./adapt_dump.sh hebratech__david_.sql hebratech_test
#   ./adapt_dump.sh hebratech__david_.sql hebratech_test --con-datos   # (no recomendado)
#
# Salida:
#   Genera schema.sql en el directorio actual, listo para reemplazar
#   en la raíz del repo.

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Uso: $0 <archivo_dump.sql> [nombre_base_datos] [--con-datos]"
  exit 1
fi

INPUT_FILE="$1"
DB_NAME="${2:-hebratech_test}"
KEEP_DATA=false
for arg in "$@"; do
  if [ "$arg" == "--con-datos" ]; then
    KEEP_DATA=true
  fi
done
OUTPUT_FILE="schema.sql"

if [ ! -f "$INPUT_FILE" ]; then
  echo "Error: no se encontró el archivo '$INPUT_FILE'"
  exit 1
fi

TMP_FILE=$(mktemp)

# 1. Quitar DEFINER=`user`@`host` y SQL SECURITY DEFINER de vistas
sed -E "s/CREATE ALGORITHM=[A-Z]+ DEFINER=\`[^\`]*\`@\`[^\`]*\` SQL SECURITY DEFINER VIEW/CREATE VIEW/g" \
  "$INPUT_FILE" > "$TMP_FILE"

# 2. Quitar filas de datos (INSERT INTO ...) salvo que se pida lo contrario.
#    Los INSERT en dumps de phpMyAdmin pueden abarcar varias líneas hasta
#    el ';' final, así que se filtran con un pequeño script en awk.
if [ "$KEEP_DATA" = false ]; then
  awk '
    /^INSERT INTO/ { skipping=1 }
    skipping {
      if ($0 ~ /;[[:space:]]*$/) { skipping=0 }
      next
    }
    { print }
  ' "$TMP_FILE" > "${TMP_FILE}.nodata"
  mv "${TMP_FILE}.nodata" "$TMP_FILE"
fi

# 3. Anteponer headers de base de datos
{
  echo "-- Schema para CI (GitHub Actions) - adaptado de $INPUT_FILE"
  echo "-- Generado automáticamente por adapt_dump.sh el $(date '+%Y-%m-%d %H:%M:%S')"
  if [ "$KEEP_DATA" = false ]; then
    echo "-- NOTA: filas de datos (INSERT INTO) removidas a propósito."
    echo "--       Solo se conserva estructura (CREATE TABLE + constraints)."
  fi
  echo ""
  echo "DROP DATABASE IF EXISTS \`${DB_NAME}\`;"
  echo "CREATE DATABASE \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
  echo "USE \`${DB_NAME}\`;"
  echo ""
  cat "$TMP_FILE"
} > "$OUTPUT_FILE"

rm -f "$TMP_FILE"

# Verificaciones básicas
REMAINING_DEFINERS=$(grep -c "DEFINER=" "$OUTPUT_FILE" || true)
TABLE_COUNT=$(grep -c "CREATE TABLE" "$OUTPUT_FILE" || true)
CONSTRAINT_COUNT=$(grep -c "ADD CONSTRAINT" "$OUTPUT_FILE" || true)
INSERT_COUNT=$(grep -c "^INSERT INTO" "$OUTPUT_FILE" || true)

# Chequeo extra: si por algún motivo quedó un client_id/secret de Google
# u otro patrón típico de credencial, avisar fuerte antes de que se suba.
SUSPICIOUS=$(grep -Ec "apps\.googleusercontent\.com|GOCSPX-|AIza[0-9A-Za-z_-]{35}|-----BEGIN [A-Z ]*PRIVATE KEY-----" "$OUTPUT_FILE" || true)

echo "✅ Generado: $OUTPUT_FILE"
echo "   Tablas encontradas: $TABLE_COUNT"
echo "   Constraints (FKs): $CONSTRAINT_COUNT"
echo "   Filas de datos (INSERT) incluidas: $INSERT_COUNT"

if [ "$REMAINING_DEFINERS" -gt 0 ]; then
  echo "⚠️  Atención: quedan $REMAINING_DEFINERS ocurrencias de DEFINER= sin limpiar."
  echo "   Revisá manualmente (puede ser un patrón distinto, ej. triggers o procedures)."
else
  echo "   Sin DEFINER pendientes."
fi

if [ "$SUSPICIOUS" -gt 0 ]; then
  echo ""
  echo "🚨 ALERTA: se detectaron $SUSPICIOUS posibles credenciales/secretos en $OUTPUT_FILE."
  echo "   NO lo commitees todavía. Revisá con:"
  echo "   grep -nE \"apps\\.googleusercontent\\.com|GOCSPX-|AIza[0-9A-Za-z_-]{35}\" $OUTPUT_FILE"
else
  echo "   Sin patrones de credenciales conocidos detectados."
fi

echo ""
echo "Siguiente paso: reemplazá schema.sql en la raíz del repo y commiteá."