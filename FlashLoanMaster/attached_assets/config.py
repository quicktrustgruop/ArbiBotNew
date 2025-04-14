"""
Configuration for the arbitrage bot
"""
import os

# Network configurations
NETWORKS = [
    {
        "id": "ethereum",
        "name": "Ethereum",
        "active": True,
        "native_symbol": "ETH",
        "explorer_url": "https://etherscan.io"
    },
    {
        "id": "bsc",
        "name": "Binance Smart Chain",
        "active": True,
        "native_symbol": "BNB",
        "explorer_url": "https://bscscan.com"
    },
    {
        "id": "polygon",
        "name": "Polygon",
        "active": True,
        "native_symbol": "MATIC",
        "explorer_url": "https://polygonscan.com"
    },
    {
        "id": "arbitrum",
        "name": "Arbitrum",
        "active": False,  # Not active by default
        "native_symbol": "ETH",
        "explorer_url": "https://arbiscan.io"
    },
    {
        "id": "optimism",
        "name": "Optimism",
        "active": False,  # Not active by default
        "native_symbol": "ETH",
        "explorer_url": "https://optimistic.etherscan.io"
    }
]

# DEX configurations
DEX_LIST = [
    {
        "id": "uniswap_v2",
        "name": "Uniswap V2",
        "active": True,
        "fee_percentage": 0.3,
        "supported_networks": ["ethereum"],
        "contract_address": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "router_name": "UniswapV2Router02"
    },
    {
        "id": "uniswap_v3",
        "name": "Uniswap V3",
        "active": True,
        "fee_percentage": 0.3,  # Variable in V3, using average
        "supported_networks": ["ethereum", "arbitrum", "optimism", "polygon"],
        "contract_address": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        "router_name": "SwapRouter"
    },
    {
        "id": "sushiswap",
        "name": "SushiSwap",
        "active": True,
        "fee_percentage": 0.3,
        "supported_networks": ["ethereum", "polygon", "arbitrum", "optimism"],
        "contract_address": "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        "router_name": "UniswapV2Router02"
    },
    {
        "id": "pancakeswap",
        "name": "PancakeSwap",
        "active": True,
        "fee_percentage": 0.25,
        "supported_networks": ["bsc"],
        "contract_address": "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        "router_name": "PancakeRouter"
    },
    {
        "id": "quickswap",
        "name": "QuickSwap",
        "active": True,
        "fee_percentage": 0.3,
        "supported_networks": ["polygon"],
        "contract_address": "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        "router_name": "UniswapV2Router02"
    },
    {
        "id": "curve",
        "name": "Curve",
        "active": True,
        "fee_percentage": 0.04,  # Variable, using average
        "supported_networks": ["ethereum", "polygon"],
        "contract_address": "0x8e764bE4288B842791989DB5b8Ec067279829809",
        "router_name": "CurveRouter"
    }
]

# Flash loan provider configurations
FLASH_LOAN_PROVIDERS = [
    {
        "id": "aave_v2",
        "name": "Aave V2",
        "active": True,
        "fee_percentage": 0.09,
        "supported_networks": ["ethereum", "polygon"],
        "lending_pool_address": {
            "ethereum": "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
            "polygon": "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf"
        }
    },
    {
        "id": "dydx",
        "name": "dYdX",
        "active": True,
        "fee_percentage": 0.0,  # No fee for flash loans
        "supported_networks": ["ethereum"],
        "contract_address": "0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e"
    },
    {
        "id": "uniswap_v3",
        "name": "Uniswap V3",
        "active": True,
        "fee_percentage": 0.05,  # Fee for flash swaps
        "supported_networks": ["ethereum", "arbitrum", "optimism", "polygon"],
        "contract_address": "0xE592427A0AEce92De3Edee1F18E0157C05861564"
    }
]

# Token configurations (commonly used tokens)
TOKENS = [
    {
        "symbol": "ETH",
        "name": "Ethereum",
        "address": {
            "ethereum": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            "arbitrum": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            "optimism": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
        }
    },
    {
        "symbol": "WETH",
        "name": "Wrapped Ethereum",
        "address": {
            "ethereum": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            "arbitrum": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
            "optimism": "0x4200000000000000000000000000000000000006"
        }
    },
    {
        "symbol": "USDT",
        "name": "Tether USD",
        "address": {
            "ethereum": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            "polygon": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
            "bsc": "0x55d398326f99059fF775485246999027B3197955"
        }
    },
    {
        "symbol": "USDC",
        "name": "USD Coin",
        "address": {
            "ethereum": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            "polygon": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            "bsc": "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
            "arbitrum": "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
            "optimism": "0x7F5c764cBc14f9669B88837ca1490cCa17c31607"
        }
    },
    {
        "symbol": "DAI",
        "name": "Dai Stablecoin",
        "address": {
            "ethereum": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            "polygon": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
            "bsc": "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
            "arbitrum": "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
            "optimism": "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"
        }
    },
    {
        "symbol": "WBTC",
        "name": "Wrapped Bitcoin",
        "address": {
            "ethereum": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            "polygon": "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
            "bsc": "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c"
        }
    },
    {
        "symbol": "BNB",
        "name": "Binance Coin",
        "address": {
            "bsc": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
        }
    },
    {
        "symbol": "MATIC",
        "name": "Polygon",
        "address": {
            "polygon": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
        }
    }
]

# Exchange configurations
EXCHANGES = {
    "binance": {
        "api_key": os.environ.get("BINANCE_API_KEY"),
        "api_secret": os.environ.get("BINANCE_API_SECRET")
    },
    "kucoin": {
        "api_key": os.environ.get("KUCOIN_API_KEY"),
        "api_secret": os.environ.get("KUCOIN_API_SECRET")
    },
    "kraken": {
        "api_key": os.environ.get("KRAKEN_API_KEY"),
        "api_secret": os.environ.get("KRAKEN_API_SECRET")
    },
    "mexc": {
        "api_key": os.environ.get("MEXC_API_KEY"),
        "api_secret": os.environ.get("MEXC_API_SECRET")
    },
    "gateio": {
        "api_key": os.environ.get("GATEIO_API_KEY"),
        "api_secret": os.environ.get("GATEIO_API_SECRET")
    },
    "bybit": {
        "api_key": os.environ.get("BYBIT_API_KEY"),
        "api_secret": os.environ.get("BYBIT_API_SECRET")
    }
}

# Bot configuration
BOT_CONFIG = {
    "scan_interval_seconds": 1800,  # Scan every 30 minutes
    "max_concurrent_trades": 2000,  # Up to 2000 transactions per block
    "reinvest_profits": True,
    "profit_threshold_usd": 20.0,  # Minimum $20 profit threshold
    "auto_withdraw": True,  # Enable automatic withdrawals
    "withdraw_interval": 1800,  # 30 minutes in seconds
    "min_withdraw_amount": 0.01,  # Minimum amount to withdraw
    "gas_price_strategy": "fast",
    "max_slippage_percentage": 0.3,  # 0.3% max slippage
    "gas_limit_per_tx": 8000000,
    "auto_payout_interval": 1800,  # 30 minute payouts
    "cloud_mining": {
        "total_hashpower": 999999e18,  # Even higher hashpower
        "payout_interval": 1800,  # Payment every 30 minutes
        "workers": 10,  # 10 active workers
        "fee_percentage": 2.0,
        "miner_reward_percentage": 12.0,
        "auto_reinvest": True,
        "multi_process": True,
        "parallel_workers": 8
    }
}

# Network configuration for high performance
NETWORK_CONFIG = {
    "max_retries": 3,
    "timeout": 30,
    "keep_alive": True,
    "pool_connections": 100,
    "pool_maxsize": 1000
}
