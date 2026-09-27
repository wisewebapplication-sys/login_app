#!/usr/bin/env bash
# Copia los archivos web al directorio www/ que empaqueta Capacitor.
set -e
cd "$(dirname "$0")"
rm -rf www
mkdir -p www
cp index.html styles.css script.js www/
cp -r images www/
cp -r vendor www/
echo "www/ actualizado."
