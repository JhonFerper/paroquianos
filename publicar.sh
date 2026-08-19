#!/usr/bin/env bash
set -euo pipefail

MESSAGE="${1:-Atualiza acervo paroquial}"

echo "Validando o acervo..."
node --check script.js
node --check events.js
node --check acervo.js
node --check criar-album.js
node --check validar.js
node validar.js

echo ""
echo "Alterações que serão publicadas:"
git status --short

if git diff --quiet && git diff --cached --quiet; then
  echo "Nenhuma alteração para publicar."
  exit 0
fi

git add -A
git diff --cached --check
git commit -m "$MESSAGE"
git push origin main

echo ""
echo "Publicado. Aguarde a atualização automática da hospedagem."
