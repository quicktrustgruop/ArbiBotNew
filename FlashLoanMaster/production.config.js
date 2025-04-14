/**
 * Configuração do Modo de Produção Real
 * 
 * Este arquivo configura o ArbiBot para execução em ambiente de produção real
 * com operações, transações, e busca de lucros em tempo real.
 */

// Configuração das redes blockchain
const NETWORKS = [
    {
        name: "ethereum",
        displayName: "Ethereum",
        chainId: 1,
        symbol: "ETH",
        rpcUrl: process.env.ETH_MAINNET_RPC || "https://eth-mainnet.g.alchemy.com/v2/F3RL542h9YLkPcVPiYB0Ph2bl9QJQ9pO",
        blockExplorerUrl: "https://etherscan.io",
        active: true,
        securityLevel: "high"
    },
    {
        name: "bsc",
        displayName: "Binance Smart Chain",
        chainId: 56,
        symbol: "BNB",
        rpcUrl: process.env.BSC_MAINNET_RPC || "https://bsc-dataseed.binance.org/",
        blockExplorerUrl: "https://bscscan.com",
        active: true,
        securityLevel: "high"
    },
    {
        name: "polygon",
        displayName: "Polygon",
        chainId: 137,
        symbol: "MATIC",
        rpcUrl: process.env.POLYGON_MAINNET_RPC || "https://polygon-mainnet.g.alchemy.com/v2/F3RL542h9YLkPcVPiYB0Ph2bl9QJQ9pO",
        blockExplorerUrl: "https://polygonscan.com",
        active: true,
        securityLevel: "high"
    },
    {
        name: "arbitrum",
        displayName: "Arbitrum",
        chainId: 42161,
        symbol: "ETH",
        rpcUrl: process.env.ARBITRUM_MAINNET_RPC || "https://arb-mainnet.g.alchemy.com/v2/F3RL542h9YLkPcVPiYB0Ph2bl9QJQ9pO",
        blockExplorerUrl: "https://arbiscan.io",
        active: true,
        securityLevel: "high"
    },
    {
        name: "optimism",
        displayName: "Optimism",
        chainId: 10,
        symbol: "ETH",
        rpcUrl: process.env.OPTIMISM_MAINNET_RPC || "https://opt-mainnet.g.alchemy.com/v2/F3RL542h9YLkPcVPiYB0Ph2bl9QJQ9pO",
        blockExplorerUrl: "https://optimistic.etherscan.io",
        active: true,
        securityLevel: "high"
    },
    {
        name: "avalanche",
        displayName: "Avalanche",
        chainId: 43114,
        symbol: "AVAX",
        rpcUrl: process.env.AVALANCHE_MAINNET_RPC || "https://api.avax.network/ext/bc/C/rpc",
        blockExplorerUrl: "https://snowtrace.io",
        active: true,
        securityLevel: "high"
    }
];

// Configuração das DEXs
const DEXES = {
    "ethereum": [
        {
            name: "uniswap",
            displayName: "Uniswap V3",
            version: "3.0.0",
            routerAddress: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
            factoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
            active: true,
            feeTiers: [500, 3000, 10000]
        },
        {
            name: "sushiswap",
            displayName: "SushiSwap",
            version: "1.0.0",
            routerAddress: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
            factoryAddress: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
            active: true,
            feeTiers: [3000]
        },
        {
            name: "curve",
            displayName: "Curve Finance",
            version: "1.0.0",
            routerAddress: "0x7d86446dDb609eD0F5f8684AcF30380a356b2B4c",
            active: true
        }
    ],
    "bsc": [
        {
            name: "pancakeswap",
            displayName: "PancakeSwap V2",
            version: "2.0.0",
            routerAddress: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
            factoryAddress: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
            active: true,
            feeTiers: [2500]
        },
        {
            name: "biswap",
            displayName: "Biswap",
            version: "1.0.0",
            routerAddress: "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8",
            factoryAddress: "0x858E3312ed3A876947EA49d572A7C42DE08af7EE",
            active: true,
            feeTiers: [1000]
        }
    ],
    "polygon": [
        {
            name: "quickswap",
            displayName: "QuickSwap",
            version: "1.0.0",
            routerAddress: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
            factoryAddress: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
            active: true,
            feeTiers: [3000]
        },
        {
            name: "sushiswap",
            displayName: "SushiSwap",
            version: "1.0.0",
            routerAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
            factoryAddress: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
            active: true,
            feeTiers: [3000]
        }
    ],
    "arbitrum": [
        {
            name: "uniswap",
            displayName: "Uniswap V3",
            version: "3.0.0",
            routerAddress: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
            factoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
            active: true,
            feeTiers: [500, 3000, 10000]
        },
        {
            name: "sushiswap",
            displayName: "SushiSwap",
            version: "1.0.0",
            routerAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
            factoryAddress: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
            active: true,
            feeTiers: [3000]
        }
    ],
    "optimism": [
        {
            name: "uniswap",
            displayName: "Uniswap V3",
            version: "3.0.0",
            routerAddress: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
            factoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
            active: true,
            feeTiers: [500, 3000, 10000]
        },
        {
            name: "velodrome",
            displayName: "Velodrome",
            version: "1.0.0",
            routerAddress: "0xa132DAB612dB5cB9fC9Ac426A0Cc215A3423F9c9",
            factoryAddress: "0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746",
            active: true
        }
    ],
    "avalanche": [
        {
            name: "traderjoe",
            displayName: "Trader Joe",
            version: "1.0.0",
            routerAddress: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
            factoryAddress: "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10",
            active: true,
            feeTiers: [3000]
        },
        {
            name: "pangolin",
            displayName: "Pangolin",
            version: "1.0.0",
            routerAddress: "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106",
            factoryAddress: "0xefa94DE7a4656D787667C749f7E1223D71E9FD88",
            active: true,
            feeTiers: [3000]
        }
    ]
};

// Configuração de tokens populares
const TOKENS = {
    "ethereum": [
        {
            symbol: "WETH",
            name: "Wrapped Ether",
            address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            decimals: 18
        },
        {
            symbol: "USDC",
            name: "USD Coin",
            address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            decimals: 6
        },
        {
            symbol: "USDT",
            name: "Tether USD",
            address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            decimals: 6
        },
        {
            symbol: "WBTC",
            name: "Wrapped Bitcoin",
            address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            decimals: 8
        },
        {
            symbol: "DAI",
            name: "Dai Stablecoin",
            address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            decimals: 18
        }
    ],
    "bsc": [
        {
            symbol: "WBNB",
            name: "Wrapped BNB",
            address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            decimals: 18
        },
        {
            symbol: "BUSD",
            name: "Binance USD",
            address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
            decimals: 18
        },
        {
            symbol: "USDT",
            name: "Tether USD",
            address: "0x55d398326f99059fF775485246999027B3197955",
            decimals: 18
        },
        {
            symbol: "BTCB",
            name: "Binance BTC",
            address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
            decimals: 18
        },
        {
            symbol: "CAKE",
            name: "PancakeSwap Token",
            address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
            decimals: 18
        }
    ],
    "polygon": [
        {
            symbol: "WMATIC",
            name: "Wrapped MATIC",
            address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            decimals: 18
        },
        {
            symbol: "USDC",
            name: "USD Coin",
            address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            decimals: 6
        },
        {
            symbol: "USDT",
            name: "Tether USD",
            address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
            decimals: 6
        },
        {
            symbol: "WETH",
            name: "Wrapped Ether",
            address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
            decimals: 18
        },
        {
            symbol: "AAVE",
            name: "Aave",
            address: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B",
            decimals: 18
        }
    ],
    "arbitrum": [
        {
            symbol: "WETH",
            name: "Wrapped Ether",
            address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
            decimals: 18
        },
        {
            symbol: "USDC",
            name: "USD Coin",
            address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
            decimals: 6
        },
        {
            symbol: "USDT",
            name: "Tether USD",
            address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
            decimals: 6
        },
        {
            symbol: "WBTC",
            name: "Wrapped Bitcoin",
            address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
            decimals: 8
        },
        {
            symbol: "GMX",
            name: "GMX",
            address: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
            decimals: 18
        }
    ],
    "optimism": [
        {
            symbol: "WETH",
            name: "Wrapped Ether",
            address: "0x4200000000000000000000000000000000000006",
            decimals: 18
        },
        {
            symbol: "USDC",
            name: "USD Coin",
            address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
            decimals: 6
        },
        {
            symbol: "USDT",
            name: "Tether USD",
            address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
            decimals: 6
        },
        {
            symbol: "OP",
            name: "Optimism",
            address: "0x4200000000000000000000000000000000000042",
            decimals: 18
        },
        {
            symbol: "DAI",
            name: "Dai Stablecoin",
            address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
            decimals: 18
        }
    ],
    "avalanche": [
        {
            symbol: "WAVAX",
            name: "Wrapped AVAX",
            address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
            decimals: 18
        },
        {
            symbol: "USDC",
            name: "USD Coin",
            address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
            decimals: 6
        },
        {
            symbol: "USDT",
            name: "Tether USD",
            address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
            decimals: 6
        },
        {
            symbol: "WETH",
            name: "Wrapped Ether",
            address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
            decimals: 18
        },
        {
            symbol: "JOE",
            name: "Trader Joe",
            address: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd",
            decimals: 18
        }
    ]
};

// Configuração de protocolos flash loan
const FLASH_LOAN_PROTOCOLS = {
    "ethereum": [
        {
            name: "aave",
            displayName: "Aave V2",
            version: "2.0.0",
            contractAddress: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
            active: true
        },
        {
            name: "dydx",
            displayName: "dYdX",
            version: "1.0.0",
            contractAddress: "0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e",
            active: true
        },
        {
            name: "uniswap",
            displayName: "Uniswap V3",
            version: "3.0.0",
            active: true
        }
    ],
    "bsc": [
        {
            name: "pancakeswap",
            displayName: "PancakeSwap",
            version: "2.0.0",
            active: true
        },
        {
            name: "venus",
            displayName: "Venus",
            version: "1.0.0",
            contractAddress: "0xfD36E2c2a6789Db23113685031d7F16329158384",
            active: true
        }
    ],
    "polygon": [
        {
            name: "aave",
            displayName: "Aave V2",
            version: "2.0.0",
            contractAddress: "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf",
            active: true
        },
        {
            name: "quickswap",
            displayName: "QuickSwap",
            version: "1.0.0",
            active: true
        }
    ],
    "arbitrum": [
        {
            name: "aave",
            displayName: "Aave V3",
            version: "3.0.0",
            contractAddress: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
            active: true
        },
        {
            name: "uniswap",
            displayName: "Uniswap V3",
            version: "3.0.0",
            active: true
        }
    ],
    "optimism": [
        {
            name: "aave",
            displayName: "Aave V3",
            version: "3.0.0",
            contractAddress: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
            active: true
        },
        {
            name: "uniswap",
            displayName: "Uniswap V3",
            version: "3.0.0",
            active: true
        }
    ],
    "avalanche": [
        {
            name: "aave",
            displayName: "Aave V3",
            version: "3.0.0",
            contractAddress: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
            active: true
        },
        {
            name: "traderjoe",
            displayName: "Trader Joe",
            version: "1.0.0",
            active: true
        }
    ]
};

// Configurações de produção
const PRODUCTION_SETTINGS = {
    // Configurações gerais
    MODE: process.env.EXECUTION_MODE || "producao_real",
    GAS_PRICE_MULTIPLIER: 1.2, // 1.2x do preço de gás recomendado
    MAX_SLIPPAGE: 0.5, // 0.5% slippage máximo
    DEFAULT_GAS_LIMIT: 500000, // Limite de gás padrão
    CONFIRMATION_BLOCKS: 1, // Número de blocos para confirmação
    
    // Taxa de atualização
    PRICE_UPDATE_INTERVAL_MS: 3000, // 3 segundos
    OPPORTUNITY_SCAN_INTERVAL_MS: 5000, // 5 segundos
    
    // Notificações
    ALERT_ON_ERRORS: true, // Alertar em caso de erros
    ALERT_ON_LARGE_PROFITS: true, // Alertar em caso de grandes lucros
    ALERT_PROFIT_THRESHOLD: 1000, // Threshold de lucro para alertas (em USD)
    
    // Arquivamento e logs
    LOG_LEVEL: "info", // Nível de log (debug, info, warn, error)
    LOG_TX_DETAILS: true, // Logar detalhes de transações
    ARCHIVE_OPPORTUNITIES: true, // Arquivar oportunidades encontradas
    KEEP_LOGS_DAYS: 30, // Manter logs por 30 dias
    
    // Segurança
    USE_FALLBACK_PROVIDER: true, // Usar provedor fallback
    MAX_CONCURRENT_REQUESTS: 10, // Máximo de requisições concorrentes
    RETRY_FAILED_TX: true, // Retentar transações falhas
    MAX_TX_RETRIES: 3, // Máximo de retentativas
    
    // Configurações de execução
    CHAIN_RETRY_DELAY_MS: 10000, // 10 segundos de delay entre retentativas
    AUTO_GAS_PRICE_ADJUSTMENT: true, // Ajustar preço de gás automaticamente
    
    // Modo extremo (para maximização de lucros)
    EXTREME_MODE: true, // Modo extremo ativado
    EXTREME_MODE_SETTINGS: {
        GAS_PRICE_MULTIPLIER: 2.0, // 2x do preço de gás recomendado
        MAX_SLIPPAGE: 1.0, // 1% slippage máximo
        CONFIRMATION_BLOCKS: 0, // Sem espera por confirmação
        PRICE_UPDATE_INTERVAL_MS: 1000, // 1 segundo
        OPPORTUNITY_SCAN_INTERVAL_MS: 2000, // 2 segundos
        MAX_CONCURRENT_REQUESTS: 20 // Dobro de requisições concorrentes
    }
};

// Exportar todas as configurações
module.exports = {
    NETWORKS,
    DEXES,
    TOKENS,
    FLASH_LOAN_PROTOCOLS,
    PRODUCTION_SETTINGS,
    
    // Helpers
    findNetworkByName(name) {
        return NETWORKS.find(n => n.name.toLowerCase() === name.toLowerCase());
    },
    
    findTokenBySymbol(networkName, symbol) {
        const network = networkName.toLowerCase();
        const tokens = TOKENS[network] || [];
        return tokens.find(t => t.symbol.toLowerCase() === symbol.toLowerCase());
    },
    
    findDexByName(networkName, dexName) {
        const network = networkName.toLowerCase();
        const dexes = DEXES[network] || [];
        return dexes.find(d => d.name.toLowerCase() === dexName.toLowerCase());
    },
    
    findFlashLoanProtocol(networkName, protocolName) {
        const network = networkName.toLowerCase();
        const protocols = FLASH_LOAN_PROTOCOLS[network] || [];
        return protocols.find(p => p.name.toLowerCase() === protocolName.toLowerCase());
    }
};