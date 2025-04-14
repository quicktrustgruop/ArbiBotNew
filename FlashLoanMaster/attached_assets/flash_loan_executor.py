import logging
import time
from typing import Dict, Any
import json
from web3 import Web3

from contract_templates import FLASH_LOAN_CONTRACT

logger = logging.getLogger(__name__)

class FlashLoanExecutor:
    """
    Class responsible for executing flash loans and arbitrage trades
    """

    def __init__(self, blockchain_connector, risk_manager):
        self.blockchain_connector = blockchain_connector
        self.risk_manager = risk_manager

    def execute_arbitrage(self, opportunity: Dict) -> Dict:
        """
        Execute a flash loan arbitrage trade based on the given opportunity

        Args:
            opportunity: Arbitrage opportunity details

        Returns:
            Dictionary with trade results
        """
        logger.info(f"Preparing to execute arbitrage: {opportunity['token_pair']['symbol']} on {opportunity['network']['name']}")

        # Final risk check before execution
        if not self.risk_manager.validate_opportunity(opportunity):
            return {
                "success": False,
                "error": "Failed final risk check",
                "details": {}
            }

        try:
            # Connect to the network
            web3 = self.blockchain_connector.connect_to_network(opportunity["network"]["id"])
            if not web3:
                return {
                    "success": False,
                    "error": f"Failed to connect to {opportunity['network']['name']}",
                    "details": {}
                }

            # Deploy flash loan contract if needed
            contract_address = self._deploy_flash_loan_contract(web3, opportunity)
            if not contract_address:
                return {
                    "success": False,
                    "error": "Failed to deploy flash loan contract",
                    "details": {}
                }

            # Prepare the transaction parameters
            tx_params = self._prepare_transaction(web3, contract_address, opportunity)

            # Execute the transaction
            tx_hash = self._send_transaction(web3, tx_params)
            if not tx_hash:
                return {
                    "success": False,
                    "error": "Transaction failed to send",
                    "details": {}
                }

            # Wait for transaction confirmation
            receipt = self._wait_for_transaction(web3, tx_hash)
            if not receipt or receipt.status == 0:
                return {
                    "success": False,
                    "error": "Transaction failed on-chain",
                    "details": {"tx_hash": tx_hash}
                }

            # Calculate actual profit
            actual_profit = self._calculate_actual_profit(web3, receipt, opportunity)

            return {
                "success": True,
                "tx_hash": tx_hash,
                "actual_profit_usd": actual_profit,
                "details": {
                    "buy_dex": opportunity["buy_dex"]["name"],
                    "sell_dex": opportunity["sell_dex"]["name"],
                    "token_pair": opportunity["token_pair"]["symbol"],
                    "price_diff_percentage": opportunity["price_diff_percentage"],
                    "network": opportunity["network"]["name"],
                    "gas_used": receipt.gasUsed,
                    "block_number": receipt.blockNumber
                }
            }

        except Exception as e:
            logger.error(f"Error executing arbitrage: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "details": {}
            }

    def _deploy_flash_loan_contract(self, web3, opportunity):
        """
        Deploy a flash loan contract for the arbitrage

        Args:
            web3: Web3 instance
            opportunity: Arbitrage opportunity

        Returns:
            Contract address if successful, None otherwise
        """
        try:
            # Deploy flash loan contract for real execution
            contract = web3.eth.contract(
                abi=FLASH_LOAN_CONTRACT["abi"],
                bytecode=FLASH_LOAN_CONTRACT["bytecode"]
            )

            # Get account for deployment
            account = self.blockchain_connector.get_account()

            # Deploy contract
            tx_hash = contract.constructor().transact({'from': account.address})
            tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

            return tx_receipt.contractAddress

        except Exception as e:
            logger.error(f"Error deploying flash loan contract: {str(e)}")
            return None

    def _prepare_transaction(self, web3, contract_address, opportunity):
        """
        Prepare transaction parameters for the flash loan

        Args:
            web3: Web3 instance
            contract_address: Flash loan contract address
            opportunity: Arbitrage opportunity

        Returns:
            Transaction parameters dictionary
        """
        # Load contract ABI
        contract_abi = json.loads(FLASH_LOAN_CONTRACT["abi"])

        # Create contract instance
        contract = web3.eth.contract(address=contract_address, abi=contract_abi)

        # Get nonce
        account = self.blockchain_connector.get_account()
        nonce = web3.eth.get_transaction_count(account.address)

        # Estimate gas price with a small buffer for faster confirmation
        gas_price = web3.eth.gas_price
        gas_price_buffered = int(gas_price * 1.1)  # 10% buffer

        # Prepare transaction parameters
        token_a = opportunity["token_pair"]["token_a"]["address"]
        token_b = opportunity["token_pair"]["token_b"]["address"]
        buy_dex = opportunity["buy_dex"]["contract_address"]
        sell_dex = opportunity["sell_dex"]["contract_address"]
        loan_amount = web3.to_wei(opportunity["loan_amount"], 'ether')

        # Prepare function call
        transaction = contract.functions.executeArbitrage(
            token_a,
            token_b,
            buy_dex,
            sell_dex,
            loan_amount
        ).build_transaction({
            'chainId': web3.eth.chain_id,
            'gas': 2000000,  # Gas limit
            'gasPrice': gas_price_buffered,
            'nonce': nonce,
        })

        return transaction

    def _send_transaction(self, web3, tx_params):
        """
        Send the transaction to the blockchain

        Args:
            web3: Web3 instance
            tx_params: Transaction parameters

        Returns:
            Transaction hash if successful, None otherwise
        """
        try:
            # Get account for signing
            account = self.blockchain_connector.get_account()

            # Sign transaction
            signed_tx = web3.eth.account.sign_transaction(tx_params, private_key=account.key)

            # Send transaction
            tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)

            logger.info(f"Transaction sent: {tx_hash.hex()}")
            return tx_hash.hex()

        except Exception as e:
            logger.error(f"Error sending transaction: {str(e)}")
            return None

    def _wait_for_transaction(self, web3, tx_hash):
        """
        Wait for transaction confirmation

        Args:
            web3: Web3 instance
            tx_hash: Transaction hash

        Returns:
            Transaction receipt if successful, None otherwise
        """
        try:
            logger.info(f"Waiting for transaction confirmation: {tx_hash}")

            # Poll for transaction receipt with timeout
            start_time = time.time()
            while time.time() - start_time < 300:  # 5 minute timeout
                try:
                    receipt = web3.eth.get_transaction_receipt(tx_hash)
                    if receipt:
                        logger.info(f"Transaction confirmed in block {receipt.blockNumber}")
                        return receipt
                except Exception:
                    # Transaction not yet mined
                    pass

                # Wait before polling again
                time.sleep(5)

            logger.error(f"Transaction confirmation timeout: {tx_hash}")
            return None

        except Exception as e:
            logger.error(f"Error waiting for transaction: {str(e)}")
            return None

    def _calculate_actual_profit(self, web3, receipt, opportunity):
        """
        Calculate the actual profit from the transaction

        Args:
            web3: Web3 instance
            receipt: Transaction receipt
            opportunity: Original opportunity

        Returns:
            Actual profit in USD
        """
        try:
            # In a real implementation, we would:
            # 1. Parse log events from the receipt to extract the profit
            # 2. Convert to USD using current token prices

            # For this example, we'll just assume a small slippage from the expected profit
            slippage_factor = 0.9  # 10% slippage
            actual_profit_usd = opportunity["expected_profit_usd"] * slippage_factor

            # Subtract gas cost
            gas_cost_wei = receipt.gasUsed * web3.eth.gas_price
            gas_cost_eth = web3.from_wei(gas_cost_wei, 'ether')

            # Convert gas cost to USD (using a fixed exchange rate for simplicity)
            if opportunity["network"]["id"] == "ethereum":
                eth_price_usd = 3500
            elif opportunity["network"]["id"] == "bsc":
                eth_price_usd = 300  # BNB price
            elif opportunity["network"]["id"] == "polygon":
                eth_price_usd = 1  # MATIC price
            else:
                eth_price_usd = 1000

            gas_cost_usd = gas_cost_eth * eth_price_usd

            # Final profit
            final_profit_usd = actual_profit_usd - gas_cost_usd

            logger.info(f"Actual profit: ${final_profit_usd:.2f} USD")
            return final_profit_usd

        except Exception as e:
            logger.error(f"Error calculating profit: {str(e)}")
            return 0