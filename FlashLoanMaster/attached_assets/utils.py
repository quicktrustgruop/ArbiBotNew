import logging
import json
from typing import Dict, List, Any
import requests
from datetime import datetime

logger = logging.getLogger(__name__)

def format_currency(amount: float, decimals: int = 2, currency: str = "$") -> str:
    """
    Format a currency amount
    
    Args:
        amount: Amount to format
        decimals: Number of decimal places
        currency: Currency symbol
        
    Returns:
        Formatted currency string
    """
    return f"{currency}{amount:,.{decimals}f}"

def format_percentage(percentage: float, decimals: int = 2) -> str:
    """
    Format a percentage value
    
    Args:
        percentage: Percentage to format
        decimals: Number of decimal places
        
    Returns:
        Formatted percentage string
    """
    return f"{percentage:.{decimals}f}%"

def time_since(timestamp: float) -> str:
    """
    Get human-readable time since a timestamp
    
    Args:
        timestamp: Unix timestamp
        
    Returns:
        Human-readable time string
    """
    now = datetime.now()
    dt = datetime.fromtimestamp(timestamp)
    diff = now - dt
    
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return f"{int(seconds)} seconds ago"
    elif seconds < 3600:
        return f"{int(seconds / 60)} minutes ago"
    elif seconds < 86400:
        return f"{int(seconds / 3600)} hours ago"
    else:
        return f"{int(seconds / 86400)} days ago"

def fetch_gas_price(network_id: str) -> Dict:
    """
    Fetch current gas price for a network
    
    Args:
        network_id: ID of the network
        
    Returns:
        Dictionary with gas price information
    """
    try:
        if network_id == "ethereum":
            # Use Etherscan API for Ethereum
            response = requests.get("https://api.etherscan.io/api?module=gastracker&action=gasoracle")
            data = response.json()
            
            if data["status"] == "1":
                return {
                    "slow": int(data["result"]["SafeGasPrice"]),
                    "standard": int(data["result"]["ProposeGasPrice"]),
                    "fast": int(data["result"]["FastGasPrice"]),
                    "unit": "gwei"
                }
        elif network_id == "bsc":
            # For BSC, use fixed values (or implement real API call)
            return {
                "slow": 5,
                "standard": 6,
                "fast": 7,
                "unit": "gwei"
            }
        elif network_id == "polygon":
            # For Polygon, use fixed values (or implement real API call)
            return {
                "slow": 30,
                "standard": 50,
                "fast": 100,
                "unit": "gwei"
            }
        
        # Default fallback
        return {
            "slow": 20,
            "standard": 40,
            "fast": 60,
            "unit": "gwei"
        }
        
    except Exception as e:
        logger.error(f"Error fetching gas price: {str(e)}")
        
        # Return fallback values
        return {
            "slow": 20,
            "standard": 40,
            "fast": 60,
            "unit": "gwei"
        }

def estimate_transaction_cost(gas_price: int, gas_limit: int, eth_price_usd: float) -> float:
    """
    Estimate transaction cost in USD
    
    Args:
        gas_price: Gas price in gwei
        gas_limit: Gas limit for the transaction
        eth_price_usd: ETH price in USD
        
    Returns:
        Estimated transaction cost in USD
    """
    # Convert gas price from gwei to ether
    gas_price_eth = gas_price / 1e9
    
    # Calculate gas cost in ether
    gas_cost_eth = gas_price_eth * gas_limit
    
    # Convert to USD
    gas_cost_usd = gas_cost_eth * eth_price_usd
    
    return gas_cost_usd

def save_json(data: Any, filename: str) -> bool:
    """
    Save data to a JSON file
    
    Args:
        data: Data to save
        filename: Filename to save to
        
    Returns:
        True if successful, False otherwise
    """
    try:
        with open(filename, 'w') as f:
            json.dump(data, f, indent=4)
        return True
    except Exception as e:
        logger.error(f"Error saving JSON file: {str(e)}")
        return False

def load_json(filename: str) -> Any:
    """
    Load data from a JSON file
    
    Args:
        filename: Filename to load from
        
    Returns:
        Loaded data, or None if an error occurred
    """
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading JSON file: {str(e)}")
        return None
