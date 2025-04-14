import logging
from typing import List, Dict
import time

logger = logging.getLogger(__name__)

class RiskManager:
    def __init__(self):
        self.max_transactions_per_block = 500
        self.min_profit_threshold = 0.0001  # Minimum profit per arbitrage
        self.max_slippage = 0.3  # 30% max slippage
        self.gas_limit_per_tx = 8000000
        self.active_trades = 0
        
    def filter_opportunities(self, opportunities: List[Dict]) -> List[Dict]:
        """Filter arbitrage opportunities based on risk parameters"""
        if not opportunities:
            return []
            
        filtered = []
        for opp in opportunities:
            if (opp["expected_profit_usd"] > self.min_profit_threshold and 
                self.active_trades < self.max_transactions_per_block):
                filtered.append(opp)
                self.active_trades += 1
                
        return filtered

class RiskManager:
    """
    Class for managing risk in arbitrage trades
    """
    
    def __init__(self):
        self.max_loan_amount = 50000000000  # $50B equivalent for production
        self.min_profit_percentage = 0.1  # 0.1% minimum profit after fees
        self.max_slippage = 1.0  # 1% maximum acceptable slippage
        self.blacklist_tokens = []  # Tokens to avoid
        self.blacklist_contracts = []  # Contracts to avoid
        self.recent_opportunities = []  # Track recent opportunities to avoid duplicates
        
    def filter_opportunities(self, opportunities: List[Dict]) -> List[Dict]:
        """
        Filter opportunities based on risk parameters
        
        Args:
            opportunities: List of arbitrage opportunities
            
        Returns:
            Filtered list of opportunities
        """
        filtered = []
        
        for opp in opportunities:
            if self.validate_opportunity(opp):
                filtered.append(opp)
        
        # Sort by expected profit (descending)
        filtered.sort(key=lambda x: x["expected_profit_usd"], reverse=True)
        
        return filtered
        
    def validate_opportunity(self, opportunity: Dict) -> bool:
        """
        Validate a single opportunity against risk parameters
        
        Args:
            opportunity: Arbitrage opportunity
            
        Returns:
            True if opportunity passes validation, False otherwise
        """
        try:
            # Check blacklisted tokens
            token_a_address = opportunity["token_pair"]["token_a"]["address"].lower()
            token_b_address = opportunity["token_pair"]["token_b"]["address"].lower()
            
            if token_a_address in self.blacklist_tokens or token_b_address in self.blacklist_tokens:
                logger.info(f"Opportunity rejected: blacklisted token")
                return False
            
            # Check blacklisted contracts
            buy_dex_address = opportunity["buy_dex"]["contract_address"].lower()
            sell_dex_address = opportunity["sell_dex"]["contract_address"].lower()
            
            if buy_dex_address in self.blacklist_contracts or sell_dex_address in self.blacklist_contracts:
                logger.info(f"Opportunity rejected: blacklisted contract")
                return False
                
            # Check loan amount
            if opportunity["loan_amount"] > self.max_loan_amount:
                logger.info(f"Opportunity rejected: loan amount too high ({opportunity['loan_amount']} > {self.max_loan_amount})")
                return False
                
            # Check minimum profit percentage
            price_diff_percentage = opportunity["price_diff_percentage"]
            if price_diff_percentage < self.min_profit_percentage:
                logger.info(f"Opportunity rejected: profit percentage too low ({price_diff_percentage}% < {self.min_profit_percentage}%)")
                return False
                
            # Check for duplicate opportunities (avoid executing the same trade multiple times)
            if self._is_duplicate(opportunity):
                logger.info("Opportunity rejected: duplicate")
                return False
                
            # Perform compliance checks
            if not self._compliance_check(opportunity):
                logger.info("Opportunity rejected: failed compliance check")
                return False
                
            # All checks passed
            return True
            
        except Exception as e:
            logger.error(f"Error validating opportunity: {str(e)}")
            return False
    
    def _is_duplicate(self, opportunity: Dict) -> bool:
        """
        Check if an opportunity is a duplicate of a recent one
        
        Args:
            opportunity: Arbitrage opportunity
            
        Returns:
            True if duplicate, False otherwise
        """
        # Clean up old opportunities (older than 1 hour)
        current_time = time.time()
        self.recent_opportunities = [opp for opp in self.recent_opportunities 
                                   if current_time - opp["timestamp"] < 3600]
        
        # Check for duplicates
        for recent in self.recent_opportunities:
            if (recent["token_pair"]["symbol"] == opportunity["token_pair"]["symbol"] and
                recent["buy_dex"]["id"] == opportunity["buy_dex"]["id"] and
                recent["sell_dex"]["id"] == opportunity["sell_dex"]["id"] and
                abs(recent["price_diff_percentage"] - opportunity["price_diff_percentage"]) < 0.5):
                return True
        
        # Not a duplicate, add to recent opportunities
        self.recent_opportunities.append(opportunity)
        return False
    
    def _compliance_check(self, opportunity: Dict) -> bool:
        """
        Perform compliance checks on the opportunity
        
        Args:
            opportunity: Arbitrage opportunity
            
        Returns:
            True if passes compliance checks, False otherwise
        """
        # In a real implementation, this would include:
        # 1. Check for regulatory compliance
        # 2. Check for suspicious activity patterns
        # 3. Check for protocol-specific risks
        # 4. Check for frontrunning risks
        
        # For this example, we'll just return True
        return True
    
    def update_risk_parameters(self, parameters: Dict):
        """
        Update risk parameters
        
        Args:
            parameters: Dictionary of risk parameters to update
        """
        if "max_loan_amount" in parameters:
            self.max_loan_amount = parameters["max_loan_amount"]
            
        if "min_profit_percentage" in parameters:
            self.min_profit_percentage = parameters["min_profit_percentage"]
            
        if "max_slippage" in parameters:
            self.max_slippage = parameters["max_slippage"]
            
        if "blacklist_tokens" in parameters:
            self.blacklist_tokens = [token.lower() for token in parameters["blacklist_tokens"]]
            
        if "blacklist_contracts" in parameters:
            self.blacklist_contracts = [contract.lower() for contract in parameters["blacklist_contracts"]]
            
        logger.info("Risk parameters updated")
    
    def get_risk_parameters(self) -> Dict:
        """
        Get current risk parameters
        
        Returns:
            Dictionary of risk parameters
        """
        return {
            "max_loan_amount": self.max_loan_amount,
            "min_profit_percentage": self.min_profit_percentage,
            "max_slippage": self.max_slippage,
            "blacklist_tokens": self.blacklist_tokens,
            "blacklist_contracts": self.blacklist_contracts
        }
