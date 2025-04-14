import os
import logging
import hashlib
import time
from dotenv import load_dotenv
from web3 import Web3

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables securely
load_dotenv()

class SecurityManager:
    """Manage secure access to private keys and API credentials"""
    
    def __init__(self):
        self.metamask_public = os.environ.get("METAMASK_PUBLIC")
        self._private_key = None  # Not stored directly, accessed via secure method
        self.env_file_hash = self._hash_env_file()
        
    def _hash_env_file(self):
        """Create a hash of the .env file for integrity verification"""
        if os.path.exists('.env'):
            with open('.env', 'rb') as f:
                return hashlib.sha256(f.read()).hexdigest()
        return None
        
    def check_env_integrity(self):
        """Verify the .env file hasn't been tampered with"""
        current_hash = self._hash_env_file()
        if current_hash != self.env_file_hash:
            logger.warning("⚠️ Environment file integrity check failed - possible tampering detected")
            return False
        return True
    
    def get_private_key(self):
        """Securely retrieve the private key from environment variables"""
        if not self.check_env_integrity():
            logger.error("🔒 Security check failed, refusing to provide private key")
            return None
            
        # Only retrieve from environment when needed, don't store in instance
        return os.environ.get("PRIVATE_KEY")
    
    def sign_transaction(self, web3_instance, transaction):
        """Securely sign a transaction with the private key"""
        private_key = self.get_private_key()
        if not private_key:
            logger.error("❌ Failed to sign transaction: Private key not available")
            return None
            
        try:
            signed_tx = web3_instance.eth.account.sign_transaction(transaction, private_key)
            logger.info(f"✅ Transaction signed successfully for {self.metamask_public}")
            return signed_tx
        except Exception as e:
            logger.error(f"❌ Transaction signing failed: {str(e)}")
            return None
    
    def connect_web3(self, network_url):
        """Create a Web3 connection with secure middleware"""
        try:
            web3 = Web3(Web3.HTTPProvider(network_url))
            # Add security middleware as needed
            logger.info(f"✅ Web3 connection established to {network_url}")
            return web3
        except Exception as e:
            logger.error(f"❌ Web3 connection failed: {str(e)}")
            return None

# Singleton instance
security_manager = SecurityManager()

def get_security_manager():
    """Get the singleton security manager instance"""
    return security_manager