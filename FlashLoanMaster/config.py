import os
from dotenv import load_dotenv

load_dotenv()

# Flask configuration
DEBUG = False
SERVER_PORT = 5000 
SERVER_HOST = '0.0.0.0'
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
MAX_THREADS = 16
MAX_WORKERS = 8
SESSION_SECRET = os.environ.get('SESSION_SECRET', 'idQ52SC0IqbRzqSITTQkjf0n5PWrbhHjE6yP8Evos0rum5CHPclaojgpCDQB5rU8U3hk9llDVwZ7hp692Aw2')

# Database settings
DATABASE_URL = os.environ.get('DATABASE_URL')

# Blockchain settings
PRIVATE_KEY = os.environ.get('PRIVATE_KEY', '')  # Deve ser configurado via variáveis de ambiente seguras
METAMASK_PUBLIC = os.environ.get('METAMASK_PUBLIC', '0x9146A9A5EFb565BF150607170CAc7C8A1b210F69')
ALCHEMY_API_KEY = os.getenv('ALCHEMY_API') #Using os.getenv as per edited code
INFURA_API_KEY = os.getenv('INFURA_API_KEY') #Using os.getenv as per edited code

# Exchange API settings
BINANCE_API_KEY = os.getenv('BINANCE_API_KEY') #Using os.getenv as per edited code
BINANCE_API_SECRET = os.getenv('BINANCE_API_SECRET') #Using os.getenv as per edited code
KUCOIN_API_KEY = os.environ.get('KUCOIN_API_KEY', '67cce78545e41a0001679e16')
KUCOIN_API_SECRET = os.environ.get('KUCOIN_API_SECRET', '6e1f01f9-c7d5-49d8-94ad-f3709c8013f2')
KRAKEN_API_KEY = os.environ.get('KRAKEN_API_KEY', 'Lv00nGBKagidAkrENeVK9whVXTMZwg8yPMI0AvUYRicQFsgP+oh/whaa')
KRAKEN_API_SECRET = os.environ.get('KRAKEN_API_SECRET', 'jcRcCy+v4585176xVkyQgLvDRrzIxDzBAMoxqJQidBMIfzPmyGZqiXxF1/ysTLl978zbRiMsoD7XAFz9smMDGg==')
MEXC_API_KEY = os.environ.get('MEXC_API_KEY', 'mx0vglQ9pU1RMD8CyB')
MEXC_API_SECRET = os.environ.get('MEXC_API_SECRET', '25a5e08224cc4ee784f5aa30caa983ac')
GATEIO_API_KEY = os.environ.get('GATEIO_API_KEY', '7cd7f6069b31fbf151230805efbbf2da')
GATEIO_API_SECRET = os.environ.get('GATEIO_API_SECRET', '259f790fda4a789c7028d07793a7bfbc8e8f591f491f6a1dcf950c07c4bc07db')
BYBIT_API_KEY = os.environ.get('BYBIT_API_KEY', '5GylgBXeRgE09HYvYK')
BYBIT_API_SECRET = os.environ.get('BYBIT_API_SECRET', '1iePXPoYdshQfLnsKYd4Sh9Kdj9IB5V9Ii9w')
COINBASE_API_KEY = os.environ.get('COINBASE_API_KEY', 'a67b9700-d80f-43a2-b37d-205997bc1866')
COINBASE_API_SECRET = os.environ.get('COINBASE_API_SECRET', 'organizations/53838846-1868-4828-b145-14531808ae40/apiKeys/a67b9700-d80f-43a2-b37d-205997bc1866')
BITGET_API_KEY = os.environ.get('BITGET_API_KEY', '7cd7f6069b31fbf151230805efbbf2da')
BITGET_API_SECRET = os.environ.get('BITGET_API_SECRET', '259f790fda4a789c7028d07793a7bfbc8e8f591f491f6a1dcf950c07c4bc07db')
BTG_PACTUAL_API_KEY = os.getenv('BTG_PACTUAL_API_KEY')
BTG_PACTUAL_SECRET = os.getenv('BTG_PACTUAL_SECRET')

# Payment gateway settings (para saque Fiat)
MERCADO_PAGO_API_KEY = os.environ.get('MERCADO_PAGO_API_KEY', 'APP_USR-286b6a40-80a7-4648-8ef4-462fc8de8503')
MERCADO_PAGO_TOKEN = os.environ.get('MERCADO_PAGO_TOKEN', 'APP_USR-1724386743151338-041220-18f3da8ce4470a23169cfc2e060dbaa5-53823999')

# Wallet addresses
BTC_DONATION_WALLET = '16LaAQi8cfyYSTzB3cDqsSkFRJGDbN1cLS'  # ONG Caminhos da Luz
ETH_INTERMEDIATE_WALLET = '0xCarteiraETH'  # Fundo QuickTrust
BTC_FINAL_PROFIT_WALLET = '1CarteiraBTC'  # Tiago José Mendes
PROFIT_BTC_WALLET = os.getenv('PROFIT_BTC_WALLET',"bc1qxcfdzz3xhc4fkjwdtmdx94glxjx0zk2m53xmth") #added from edited code
REPORT_EMAIL = os.getenv('REPORT_EMAIL',"tiagojosemendes841@gmail.com") #added from edited code


# Network RPC URLs (using Alchemy - F3RL542h9YLkPcVPiYB0Ph2bl9QJQ9pO)
RPC_URLS = { #Using the edited code's dictionary structure
    'ethereum': f'https://eth-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}',
    'bsc': f'https://bsc-mainnet.alchemy.com/v2/{ALCHEMY_API_KEY}',
    'polygon': f'https://polygon-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}',
    'arbitrum': f'https://arb-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}',
    'optimism': f'https://opt-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}'
}

ETHEREUM_RPC_URL = RPC_URLS.get('ethereum', f"https://eth-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}")
BSC_RPC_URL = RPC_URLS.get('bsc', f"https://bnb-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}")
POLYGON_RPC_URL = RPC_URLS.get('polygon', f"https://polygon-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}")
ARBITRUM_RPC_URL = RPC_URLS.get('arbitrum', f"https://arb-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}")
OPTIMISM_RPC_URL = RPC_URLS.get('optimism', f"https://opt-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}")
ZKSYNC_RPC_URL = f"https://zksync-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}"
STARKNET_RPC_URL = f"https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/{ALCHEMY_API_KEY}"
ARBITRUM_NOVA_RPC_URL = f"https://arbnova-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}"
POLYGON_ZKEVM_RPC_URL = f"https://polygonzkevm-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}"
BASE_RPC_URL = f"https://base-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}"
AVALANCHE_RPC_URL = f"https://avax-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}"
SOLANA_RPC_URL = f"https://solana-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}"
SCROLL_RPC_URL = f"https://scroll-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}"
BLAST_RPC_URL = f"https://blast-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}"
LINEA_RPC_URL = f"https://linea-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}"

# Default networks to monitor
DEFAULT_NETWORKS = [
    {
        'network_name': 'Ethereum',
        'rpc_url': ETHEREUM_RPC_URL,
        'chain_id': 1,
        'active': True,
        'explorer_url': 'https://etherscan.io'
    },
    {
        'network_name': 'BSC',
        'rpc_url': BSC_RPC_URL,
        'chain_id': 56,
        'active': True,
        'explorer_url': 'https://bscscan.com'
    },
    {
        'network_name': 'Polygon',
        'rpc_url': POLYGON_RPC_URL,
        'chain_id': 137,
        'active': True,
        'explorer_url': 'https://polygonscan.com'
    },
    {
        'network_name': 'Arbitrum',
        'rpc_url': ARBITRUM_RPC_URL,
        'chain_id': 42161,
        'active': True,
        'explorer_url': 'https://arbiscan.io'
    },
    {
        'network_name': 'Optimism',
        'rpc_url': OPTIMISM_RPC_URL,
        'chain_id': 10,
        'active': True,
        'explorer_url': 'https://optimistic.etherscan.io'
    },
    {
        'network_name': 'ZkSync',
        'rpc_url': ZKSYNC_RPC_URL,
        'chain_id': 324,
        'active': True,
        'explorer_url': 'https://explorer.zksync.io/'
    },
    {
        'network_name': 'Base',
        'rpc_url': BASE_RPC_URL,
        'chain_id': 8453,
        'active': True,
        'explorer_url': 'https://basescan.org/'
    },
    {
        'network_name': 'Avalanche',
        'rpc_url': AVALANCHE_RPC_URL,
        'chain_id': 43114,
        'active': True,
        'explorer_url': 'https://snowtrace.io/'
    },
    {
        'network_name': 'Arbitrum Nova',
        'rpc_url': ARBITRUM_NOVA_RPC_URL,
        'chain_id': 42170,
        'active': True,
        'explorer_url': 'https://nova.arbiscan.io/'
    },
    {
        'network_name': 'Polygon ZkEVM',
        'rpc_url': POLYGON_ZKEVM_RPC_URL,
        'chain_id': 1101,
        'active': True,
        'explorer_url': 'https://zkevm.polygonscan.com/'
    },
    {
        'network_name': 'Scroll',
        'rpc_url': SCROLL_RPC_URL,
        'chain_id': 534352,
        'active': True,
        'explorer_url': 'https://scrollscan.com/'
    },
    {
        'network_name': 'Blast',
        'rpc_url': BLAST_RPC_URL,
        'chain_id': 81457,
        'active': True,
        'explorer_url': 'https://blastscan.io/'
    },
    {
        'network_name': 'Linea',
        'rpc_url': LINEA_RPC_URL,
        'chain_id': 59144,
        'active': True,
        'explorer_url': 'https://lineascan.build/'
    }
]

# Risk management defaults
DEFAULT_MIN_PROFIT_THRESHOLD = 0.5  # 0.5%
DEFAULT_MAX_SLIPPAGE = 3.0  # 3%
DEFAULT_MAX_GAS_COST = 100.0  # $100
DEFAULT_MAX_EXPOSURE = 1000.0  # $1000

# Trading Configuration
MIN_PROFIT_THRESHOLD = 0.5  # 0.5%
TARGET_DAILY_PROFIT = 10_000_000  # $10M daily target
PROFIT_GOALS = {
    'daily_usd': 10_000_000,  # $10M per day
    'weekly_usd': 70_000_000  # $70M per week
}
PROFIT_DISTRIBUTION = {
    'btc_wallet': 1.0  # 100% to BTC wallet
}

# Cloud mining simulation settings
MINING_SIMULATION_ENABLED = True
MINING_SIMULATION_INTERVAL = 3600  # 1 hour