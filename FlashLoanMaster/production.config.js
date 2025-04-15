const NETWORKS = [
    {
      name: 'ethereum',
      displayName: 'Ethereum',
      chainId: 1,
      symbol: 'ETH',
      rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
      blockExplorerUrl: 'https://etherscan.io',
      active: true,
      securityLevel: 'high'
    },
    {
      name: 'bsc',
      displayName: 'Binance Smart Chain',
      chainId: 56,
      symbol: 'BNB',
      rpcUrl: 'https://bsc-dataseed.binance.org/',
      blockExplorerUrl: 'https://bscscan.com',
      active: true,
      securityLevel: 'high'
    }
  ];
  
  const DEXES = {
    ethereum: [
      {
        name: 'uniswap',
        displayName: 'Uniswap V3',
        routerAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        version: '3.0.0',
        active: true,
        feeTiers: [500, 3000, 10000]
      },
      {
        name: 'sushiswap',
        displayName: 'SushiSwap',
        routerAddress: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
        factoryAddress: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
        version: '1.0.0',
        active: true,
        feeTiers: [3000]
      },
      {
        name: 'curve',
        displayName: 'Curve Finance',
        routerAddress: '0x7d86446dDb609eD0F5f8684AcF30380a356b2B4c',
        version: '1.0.0',
        active: true
      }
    ],
    bsc: [
      {
        name: 'pancakeswap',
        displayName: 'PancakeSwap V2',
        routerAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
        factoryAddress: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
        version: '2.0.0',
        active: true,
        feeTiers: [2500]
      },
      {
        name: 'biswap',
        displayName: 'Biswap',
        routerAddress: '0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8',
        factoryAddress: '0x858E3312ed3A876947EA49d572A7C42DE08af7EE',
        version: '1.0.0',
        active: true,
        feeTiers: [1000]
      }
    ]
  };
  
  const TOKENS = {
    ethereum: [
      { symbol: 'USDT', name: 'Tether USD', address: '0xUSDTAddress', decimals: 6 },
      { symbol: 'DAI', name: 'Dai Stablecoin', address: '0xDAIAddress', decimals: 18 }
    ],
    bsc: [
      { symbol: 'BUSD', name: 'Binance USD', address: '0xBUSDAddress', decimals: 18 }
    ]
  };
  
  const FLASH_LOAN_PROTOCOLS = {
    ethereum: [
      {
        name: 'AaveV2',
        displayName: 'Aave V2',
        contractAddress: '0xAaveV2Address',
        version: '2.0.0',
        active: true
      },
      {
        name: 'DyDx',
        displayName: 'dYdX',
        contractAddress: '0xDyDxAddress',
        version: '1.0.0',
        active: true
      }
    ],
    bsc: [
      {
        name: 'PancakeFlash',
        displayName: 'PancakeSwap Flash Loan',
        version: '2.0.0',
        active: true
      }
    ]
  };
  
  const PRODUCTION_SETTINGS = {
    MODE: 'producao_real',
    MAX_CONCURRENT_REQUESTS: 10,
    ALERT_PROFIT_THRESHOLD: 1000,
    GAS_PRICE_MULTIPLIER: 1.2,
    MAX_SLIPPAGE: 0.5,
    DEFAULT_GAS_LIMIT: 500000,
    CONFIRMATION_BLOCKS: 1,
    PRICE_UPDATE_INTERVAL_MS: 3000,
    OPPORTUNITY_SCAN_INTERVAL_MS: 5000,
    ALERT_ON_ERRORS: true,
    ALERT_ON_LARGE_PROFITS: true,
    LOG_LEVEL: 'info',
    LOG_TX_DETAILS: true,
    ARCHIVE_OPPORTUNITIES: true,
    KEEP_LOGS_DAYS: 30,
    USE_FALLBACK_PROVIDER: true,
    RETRY_FAILED_TX: true,
    MAX_TX_RETRIES: 3,
    CHAIN_RETRY_DELAY_MS: 10000,
    AUTO_GAS_PRICE_ADJUSTMENT: true
  };
  
  const SECURITY = {
    requirePrivateKey: true,
    enableAuditLogs: true,
    enforceRateLimiting: true
  };
  
  function findNetworkByName(name) {
    return NETWORKS.find(n => n.name.toLowerCase() === name.toLowerCase());
  }
  
  function findTokenBySymbol(networkName, symbol) {
    const tokens = TOKENS[networkName.toLowerCase()] || [];
    return tokens.find(t => t.symbol.toLowerCase() === symbol.toLowerCase());
  }
  
  function findDexByName(networkName, dexName) {
    const dexes = DEXES[networkName.toLowerCase()] || [];
    return dexes.find(d => d.name.toLowerCase() === dexName.toLowerCase());
  }
  
  function findFlashLoanProtocol(networkName, protocolName) {
    const protocols = FLASH_LOAN_PROTOCOLS[networkName.toLowerCase()] || [];
    return protocols.find(p => p.name.toLowerCase() === protocolName.toLowerCase());
  }
  
  module.exports = {
    NETWORKS,
    DEXES,
    TOKENS,
    FLASH_LOAN_PROTOCOLS,
    PRODUCTION_SETTINGS,
    SECURITY,
    findNetworkByName,
    findTokenBySymbol,
    findDexByName,
    findFlashLoanProtocol
  };
    