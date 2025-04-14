/**
 * 🔥 CONFIGURAÇÃO DE ALTA LUCRATIVIDADE 🔥
 * 
 * Este arquivo contém configurações otimizadas para obter lucros massivos
 * em curto período de tempo através de estratégias de arbitragem, flash loans
 * e exploração de oportunidades cross-chain.
 * 
 * 🎯 Metas:
 * - 24 horas: R$ 500.000.000 ($ 10.000.000,00)
 * - 7 dias: R$ 700.000.000,00 ($ 70.000.000,00)
 */

require('dotenv').config();

// Configuração de lucros e metas
const PROFIT_CONFIG = {
    EXECUTION_MODE: "producao_real",
    REAL_EXECUTION: true,
    META_24H_USD: 10000000, // $10M por dia
    META_7D_USD: 70000000, // $70M em 7 dias
    FLASH_LOAN_TAXA: 0.09,
    MULTIPLICADOR_FLASH_LOAN: 100,
    LUCRO_MIN_POR_OPERACAO_PERC: 0.1,
    LUCRO_ALVO_POR_OPERACAO_PERC: 3.0,
    PAUSA_ENTRE_OPERACOES_MS: 1000,
    // Metas financeiras
    META_24H_BRL: 50000000, // R$ 50.000.000,00
    META_24H_USD: 10000000, // $ 10.000.000,00
    META_7D_BRL: 700000000, // R$ 700.000.000,00
    META_7D_USD: 70000000, // $ 70.000.000,00

    // Metas de lucro por operação
    LUCRO_MIN_POR_OPERACAO_PERC: 0.5, // Mínimo 0.5% de lucro por operação
    LUCRO_ALVO_POR_OPERACAO_PERC: 2.0, // Alvo de 2% de lucro por operação
    LUCRO_MAX_POR_OPERACAO_USD: 50000, // Máximo de $50.000 por operação

    // Metas de tempo
    OPERACOES_POR_HORA: 120, // 120 operações por hora = 2 por minuto
    CICLO_OPERACAO_MS: 30 * 60 * 1000, // 30 minutos por ciclo completo

    // Porcentagem de reinvestimento de lucros
    REINVESTIMENTO_PERC: 70, // 70% dos lucros são reinvestidos

    // Distribuição de lucros (respeitando as redes principais)
    DESTINOS_LUCRO: [
        { nome: "ONG Caminhos da Luz", tipo: "BTC", rede: "bitcoin", endereco: "16LaAQi8cfyYSTzB3cDqsSkFRJGDbN1cLS", percentual: 5 },
        { nome: "Fundo QuickTrust", tipo: "ETH", rede: "ethereum", endereco: "0x9146A9A5EFb565BF150607170CAc7C8A1b210F69", percentual: 15 },
        { nome: "Tiago José Mendes", tipo: "BNB", rede: "bsc", endereco: "0x9146A9A5EFb565BF150607170CAc7C8A1b210F69", percentual: 80 }
    ],

    // Valores monetários
    CAPITAL_INICIAL_USD: 1000, // Capital inicial para operações (usando flash loans, valor será multiplicado)
    MULTIPLICADOR_FLASH_LOAN: 1000, // Multiplicador do capital via flash loans (1000x)

    // Flash loan settings
    FLASH_LOAN_VALOR_BASE: 100000, // $100.000 por flash loan
    FLASH_LOAN_MAX_VALOR: 10000000, // Máximo de $10M por flash loan
    FLASH_LOAN_TAXA: 0.09, // 0.09% taxa Aave

    // Fatores de escalabilidade
    CRESCIMENTO_DIARIO: 3.0, // 3x de crescimento ao dia
    AUMENTO_MULTIPLICADOR_POR_SUCESSO: 1.5, // Aumenta 1.5x após cada operação bem-sucedida

    // Segurança e limites
    PAUSA_ENTRE_OPERACOES_MS: 500, // 500ms entre operações
    LIMITE_GAS_GWEI: 100, // Limitar gás a 100 gwei máximo
    USAR_FALHA_PRIORITARIA: true, // Usar falha priorizada para obter prioridade nas transações
    MULTIPLICADOR_GAS: 1.2, // 1.2x do preço de gás para confirmar mais rápido

    // Carteiras e segurança
    CARTEIRA_PRINCIPAL: process.env.METAMASK_PUBLIC || "0x9146A9A5EFb565BF150607170CAc7C8A1b210F69",

    // MEV Protection
    USAR_FLASHBOTS: true, // Usar Flashbots para proteção contra MEV

    // APIs e provedores
    INFURA_KEY: process.env.INFURA_API_KEY,
    ALCHEMY_KEY: process.env.ALCHEMY_API_KEY || "F3RL542h9YLkPcVPiYB0Ph2bl9QJQ9pO",

    // Análise de mercado
    THRESHOLD_VOLATILIDADE: 2.0, // 2% de volatilidade mínima para operações
    USAR_ALGORITMO_PREDICAO: true, // Usar algoritmo preditivo para antecipar movimentos

    // Redes mais lucrativas (classificação)
    REDES_PRIORITARIAS: [
        "arbitrum", // Arbitrum
        "optimism", // Optimism
        "polygon",  // Polygon
        "ethereum", // Ethereum
        "bsc",      // Binance Smart Chain
        "avalanche" // Avalanche
    ],

    // DEXs mais lucrativos (classificação)
    DEXS_PRIORITARIOS: {
        "ethereum": ["uniswap", "sushiswap", "curve", "balancer"],
        "arbitrum": ["uniswap", "sushiswap", "curve", "balancer"],
        "optimism": ["uniswap", "velodrome", "curve", "sushiswap"],
        "polygon": ["quickswap", "sushiswap", "curve", "balancer"],
        "bsc": ["pancakeswap", "sushiswap", "ellipsis", "biswap"],
        "avalanche": ["traderjoe", "sushiswap", "curve", "pangolin"]
    },

    // Pares mais lucrativos (classificação)
    PARES_PRIORITARIOS: {
        "ethereum": ["WETH/USDC", "WBTC/WETH", "USDC/USDT", "ETH/WBTC", "ETH/DAI"],
        "arbitrum": ["WETH/USDC", "WBTC/WETH", "USDC/USDT", "GMX/WETH", "MAGIC/WETH"],
        "optimism": ["WETH/USDC", "OP/WETH", "USDC/USDT", "WETH/DAI", "VELO/WETH"],
        "polygon": ["WMATIC/USDC", "WETH/USDC", "USDC/USDT", "MATIC/WETH", "AAVE/WETH"],
        "bsc": ["WBNB/BUSD", "CAKE/WBNB", "BUSD/USDT", "BNB/ETH", "BTCB/BNB"],
        "avalanche": ["WAVAX/USDC", "WAVAX/USDT", "ETH/AVAX", "AVAX/USDC", "USDC/USDT"]
    },

    // MEV Bundle
    MEV_BUNDLE_PRIORITY_FEE: 2, // 2 GWEI prioridade

    // Monitoramento
    ALERTAS_TELEGRAM: false, // Desativado por padrão
    TELEGRAM_BOT_TOKEN: "", // Adicionar se necessário
    TELEGRAM_CHAT_ID: "", // Adicionar se necessário

    // Anti-detecção / Privacidade
    RANDOMIZAR_VALORES: true, // Randomiza valores para evitar detecção de padrões
    DISTRIBUIR_OPERACOES: true, // Distribuir operações entre redes

    // Web3 Settings
    RPC_TIMEOUT_MS: 10000, // 10s timeout
    MAX_TENTATIVAS_TRANSACAO: 3, // 3 tentativas por transação

    // Contagens e limites
    MAX_TRANSACOES_PENDENTES: 5, // Máximo de transações pendentes

    // Configurações de modo
    MODO_EXECUCAO: process.env.EXECUTION_MODE || "producao_real",
    MODO_EXTREMO: true, // Modo extremo para lucros máximos
};

// Configuração do orquestrador
const ORCHESTRATOR_CONFIG = {
    // Modo de operação
    MODOS_OPERACAO: {
        ARBITRAGEM: true, // Buscar oportunidades de arbitragem
        FLASH_LOAN: true, // Usar flash loans para alavancagem
        SANDWICH: false, // Desativado (motivos éticos)
        SNIPER: true, // Token sniper para novos lançamentos
        LIQUIDACAO: true, // Liquidação de posições CDC
        CROSS_CHAIN: true, // Arbitragem entre redes
        MERCADO_BAIXISTA: true, // Estratégias para mercado em queda
        LIQUIDITY_MINING: true, // Mining de liquidez
        STAKING: true, // Staking
        FARMING: true, // Yield farming
        ORACLE_EXPLOIT: false, // Desativado (motivos éticos)
    },

    // Configurações de inicialização
    MAX_EXECUCOES_SIMULTANEAS: 10, // Máximo de execuções simultâneas
    MODO_TURBO: true, // Modo turbo para lucros máximos
    ROTACAO_ESTRATEGIAS: true, // Rotacionar estratégias para maximizar lucros
    MODO_GRID: true, // Usar trading em grid

    // Evolução e adaptação
    ADAPTACAO_DINAMICA: true, // Adaptar estratégias com base em resultados
    RETRAINING_INTERVAL_MS: 3600000, // 1 hora para retreinamento
    MUTATION_RATE: 0.1, // 10% taxa de mutação em estratégias

    // Prioridade de processamento
    PRIORIDADE_OPERACOES: [
        { tipo: "arbitragem", peso: 10 }, // Prioridade máxima
        { tipo: "flash_loan", peso: 9 },
        { tipo: "sniper", peso: 8 },
        { tipo: "liquidacao", peso: 7 },
        { tipo: "cross_chain", peso: 6 },
        { tipo: "farming", peso: 5 },
        { tipo: "staking", peso: 4 },
        { tipo: "liquidity_mining", peso: 3 }
    ],

    // Divisão de recursos
    ALOCACAO_RECURSOS: {
        ARBITRAGEM: 30, // 30% dos recursos
        FLASH_LOAN: 30, // 30% dos recursos
        SNIPER: 10, // 10% dos recursos
        LIQUIDACAO: 10, // 10% dos recursos
        CROSS_CHAIN: 10, // 10% dos recursos
        OUTROS: 10 // 10% para outras estratégias
    },

    // Configurações de paralelismo
    PARALELISMO: true, // Executar em paralelo
    WORKERS_POR_REDE: 2, // 2 workers por rede blockchain

    // Execução segmentada
    EXECUCAO_SEGMENTADA: true, // Dividir execução em segmentos
    SEGMENTOS: 4, // 4 segmentos por execução completa

    // Heartbeat e liveness
    HEARTBEAT_INTERVAL_MS: 60000, // 60s heartbeat
    WATCHDOG_TIMEOUT_MS: 300000, // 5min timeout para watchdog

    // Controles antifalha
    AUTO_RETRY: true, // Retentar automaticamente
    CIRCUIT_BREAKER: true, // Interromper em caso de falhas consecutivas
    FALHAS_CONSECUTIVAS_LIMITE: 5, // 5 falhas consecutivas
};

// Exportar configurações combinadas
module.exports = {
    PROFIT_CONFIG,
    ORCHESTRATOR_CONFIG,

    // Helpers
    getNetworkPriority(networkName) {
        const idx = PROFIT_CONFIG.REDES_PRIORITARIAS.indexOf(networkName.toLowerCase());
        return idx === -1 ? 999 : idx; // Menor = maior prioridade
    },

    getDexPriority(networkName, dexName) {
        const network = networkName.toLowerCase();
        const dexes = PROFIT_CONFIG.DEXS_PRIORITARIOS[network] || [];
        const idx = dexes.indexOf(dexName.toLowerCase());
        return idx === -1 ? 999 : idx; // Menor = maior prioridade
    },

    getPairPriority(networkName, pairName) {
        const network = networkName.toLowerCase();
        const pairs = PROFIT_CONFIG.PARES_PRIORITARIOS[network] || [];
        const idx = pairs.indexOf(pairName.toUpperCase());
        return idx === -1 ? 999 : idx; // Menor = maior prioridade
    },

    // Helpers para cálculos financeiros
    calcularMetaHoraria(metaDiaria) {
        return metaDiaria / 24;
    },

    calcularMetaPorOperacao(metaHoraria, operacoesPorHora) {
        return metaHoraria / operacoesPorHora;
    }
};