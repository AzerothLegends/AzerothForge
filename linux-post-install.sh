#!/bin/bash

# Caminho para o chrome-sandbox
SANDBOX_PATH="/opt/azeroth-forge/chrome-sandbox"

# Verifica se o arquivo chrome-sandbox existe
if [ -f "$SANDBOX_PATH" ]; then
    # Altera o proprietário para root
    sudo chown root "$SANDBOX_PATH"
    # Ajusta as permissões para 4755
    sudo chmod 4755 "$SANDBOX_PATH"
    echo "Permissões do chrome-sandbox ajustadas com sucesso."
else
    echo "Erro: $SANDBOX_PATH não encontrado."
fi