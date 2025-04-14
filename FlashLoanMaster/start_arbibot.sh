#!/bin/bash
# Script para iniciar o ArbiBot com IA Evolutiva
# Este script inicia o sistema completo em produção real

# Exibir banner
echo -e "\033[1;36m"
echo "====================================================="
echo "                ARBIBOT SYSTEM"
echo "         IA EVOLUTIVA EM PRODUÇÃO REAL"
echo "====================================================="
echo -e "\033[0m"

# Verificar dependências
echo -e "\033[1;33m🔍 Verificando dependências...\033[0m"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "\033[1;31m❌ Node.js não encontrado. Por favor, instale o Node.js.\033[0m"
    exit 1
fi

# Verificar se os pacotes necessários estão instalados
if [ ! -d "node_modules" ]; then
    echo -e "\033[1;33m📦 Instalando dependências...\033[0m"
    npm install
fi

# Verificar se os diretórios necessários existem
for dir in bots strategies optimizations contracts logs; do
    if [ ! -d "$dir" ]; then
        echo -e "\033[1;33m📁 Criando diretório $dir...\033[0m"
        mkdir -p "$dir"
    fi
done

# Exibir data e hora
echo -e "\033[1;33m🕒 Data/Hora: $(date)\033[0m"

# Opções de inicialização
echo -e "\033[1;32m"
echo "====================================================="
echo "               OPÇÕES DE INICIALIZAÇÃO"
echo "====================================================="
echo "1. Iniciar sistema completo (produção real)"
echo "2. Iniciar demonstração rápida"
echo "3. Iniciar geração massiva de bots"
echo "4. Deploy no Replit (512MB)"
echo "5. INICIAR MODO ALTA LUCRATIVIDADE (METAS: R$500K/24h, R$300M/7d)"
echo "6. 🌟 INICIAR MODO SUPREMO ELITE UNIVERSAL - TODAS AS DEXS E CEXS 🌟"
echo "7. Sair"
echo "====================================================="
echo -e "\033[0m"

# Solicitar opção
read -p "Escolha uma opção (1-7): " opcao

case $opcao in
    1)
        echo -e "\033[1;33m🚀 Iniciando sistema completo em produção real...\033[0m"
        node evo_bot_system_expanded.js
        ;;
    2)
        echo -e "\033[1;33m🚀 Iniciando demonstração rápida...\033[0m"
        node quick_start.js
        ;;
    3)
        echo -e "\033[1;33m🚀 Iniciando geração massiva de bots...\033[0m"
        node generate_massive_bot_system.js
        ;;
    4)
        echo -e "\033[1;33m🚀 Iniciando deploy no Replit (512MB)...\033[0m"
        ./deploy_replit.sh
        ;;
    5)
        echo -e "\033[1;35m💰 INICIANDO MODO ALTA LUCRATIVIDADE (METAS: R$500K/24h, R$300M/7d)...\033[0m"
        echo -e "\033[1;31m"
        echo "==================================================================="
        echo "⚠️  AVISO: MODO DE ALTA LUCRATIVIDADE ATIVADO!"
        echo "==================================================================="
        echo "💰 META 24H: R$ 500.000,00 ($ 100.000,00)"
        echo "💰 META 7D:  R$ 300.000.000,00 ($ 60.000.000,00)"
        echo "==================================================================="
        echo -e "\033[0m"

        # Perguntar se deseja realmente continuar
        read -p "Tem certeza que deseja executar o modo de alta lucratividade? (s/n): " confirmacao
        if [ "$confirmacao" != "s" ] && [ "$confirmacao" != "S" ]; then
            echo -e "\033[1;33m👋 Operação cancelada pelo usuário.\033[0m"
            exit 0
        fi

        # Verificar .env e outras configurações necessárias
        if [ ! -f .env ]; then
            echo -e "\033[1;31m❌ Arquivo .env não encontrado. Criando...\033[0m"
            touch .env
            echo "# Arquivo de configuração para o modo de alta lucratividade" >> .env
            echo "EXECUTION_MODE=producao_real" >> .env
            echo "ALCHEMY_API_KEY=F3RL542h9YLkPcVPiYB0Ph2bl9QJQ9pO" >> .env
            # Solicitar ao usuário a chave privada se não existir
            echo -e "\033[1;33m⚠️ Uma chave privada é necessária para transações em modo de produção.\033[0m"
            read -sp "Digite sua chave privada MetaMask (pressione Enter para pular): " private_key
            echo ""
            if [ ! -z "$private_key" ]; then
                echo "PRIVATE_KEY=$private_key" >> .env
            fi
        fi

        # Executar o executor de alta lucratividade
        echo -e "\033[1;35m🚀 Iniciando executor de alta lucratividade...\033[0m"
        node high_profit_executor.js
        ;;
    6)
        echo -e "\033[1;45m🌟 INICIANDO MODO SUPREMO ELITE UNIVERSAL 🌟\033[0m"
        echo -e "\033[1;35m"
        echo "==================================================================="
        echo "⚠️⚠️⚠️  AVISO: MODO SUPREMO ELITE UNIVERSAL ATIVADO!  ⚠️⚠️⚠️"
        echo "==================================================================="
        echo "💰 META 24H: R$ 500.000,00 ($ 100.000,00)"
        echo "💰 META 7D:  R$ 300.000.000,00 ($ 60.000.000,00)"
        echo "==================================================================="
        echo "🌍 BUSCANDO EM TODAS AS DEXS E CEXS"
        echo "⚡ FLASH LOANS SEM LIMITES DE VALORES"
        echo "🔄 OPERANDO 24H/7D EM TODAS AS BLOCKCHAINS"
        echo "==================================================================="
        echo -e "\033[0m"

        # Perguntar se deseja realmente continuar
        read -p "⚠️ ATENÇÃO: Tem certeza que deseja executar o MODO SUPREMO ELITE? (s/n): " confirmacao
        if [ "$confirmacao" != "s" ] && [ "$confirmacao" != "S" ]; then
            echo -e "\033[1;33m👋 Operação cancelada pelo usuário.\033[0m"
            exit 0
        fi

        # Segunda confirmação para garantir
        echo -e "\033[1;31m⚠️ CONFIRMAÇÃO FINAL: Este modo opera em todas as redes e exchanges sem limites!\033[0m"
        echo -e "\033[1;31mDigite CONFIRMO em maiúsculas para prosseguir: \033[0m"
        read confirmacao_final
        if [ "$confirmacao_final" != "CONFIRMO" ]; then
            echo -e "\033[1;33m👋 Operação cancelada. Digite CONFIRMO em maiúsculas para confirmar.\033[0m"
            exit 0
        fi

        # Verificar .env e outras configurações necessárias
        if [ ! -f .env ]; then
            echo -e "\033[1;31m❌ Arquivo .env não encontrado. Criando...\033[0m"
            touch .env
            echo "# Arquivo de configuração para o modo SUPREMO ELITE" >> .env
            echo "EXECUTION_MODE=supreme_elite" >> .env
            echo "ALCHEMY_API_KEY=F3RL542h9YLkPcVPiYB0Ph2bl9QJQ9pO" >> .env
            echo "INFURA_API_KEY=${INFURA_API_KEY:-''}" >> .env
            
            # Solicitar ao usuário a chave privada se não existir
            echo -e "\033[1;33m⚠️ Uma chave privada é necessária para transações em modo de produção.\033[0m"
            read -sp "Digite sua chave privada MetaMask (pressione Enter para pular): " private_key
            echo ""
            if [ ! -z "$private_key" ]; then
                echo "PRIVATE_KEY=$private_key" >> .env
            fi
        fi

        # Executar o executor supremo
        echo -e "\033[1;45m🚀 INICIANDO SUPREME ELITE EXECUTOR...\033[0m"
        node supreme_elite_executor.js
        ;;
    7)
        echo -e "\033[1;33m👋 Saindo...\033[0m"
        exit 0
        ;;
    *)
        echo -e "\033[1;31m❌ Opção inválida.\033[0m"
        exit 1
        ;;
esac
#!/bin/bash

echo "Starting ArbiBot System..."

# Set environment variables
export NODE_OPTIONS="--max-old-space-size=480"
export LOG_LEVEL="info"
export PRODUCTION_MODE="true"

# Create necessary directories
mkdir -p logs
mkdir -p data
mkdir -p bots
mkdir -p strategies
mkdir -p contracts

# Start the main application
python main.py
