
import logging
from bitcoinlib.wallets import Wallet
from decimal import Decimal
from config import PROFIT_BTC_WALLET, REPORT_EMAIL
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

class ProfitHandler:
    def __init__(self):
        self.btc_wallet = PROFIT_BTC_WALLET
        self.report_email = REPORT_EMAIL
        
    def send_profits_to_btc(self, amount: Decimal):
        """Send profits to configured BTC wallet"""
        try:
            logger.info(f"Sending {amount} BTC to {self.btc_wallet}")
            # Initialize wallet using BTG Pactual's infrastructure with higher security
            wallet = Wallet.create('btg_wallet', 
                                 network='bitcoin',
                                 witness_type='segwit',
                                 multisig=True,
                                 cosigner_count=2)
            
            # Implement profit distribution
            gas_reserve = amount * Decimal('0.10')  # 10% for gas
            operations = amount * Decimal('0.20')   # 20% for operations
            btc_profit = amount * Decimal('0.70')   # 70% to BTC wallet
            
            # Create and send transaction
            tx_id = wallet.send_to(self.btc_wallet, amount)
            
            # Send report
            self.send_report(amount, tx_id)
            
            return tx_id
            
        except Exception as e:
            logger.error(f"Error sending profits to BTC wallet: {str(e)}")
            raise
            
    def send_report(self, amount: Decimal, tx_id: str):
        """Send profit report via email"""
        try:
            subject = "Profit Distribution Report"
            body = f"""
            Profit Distribution Report
            
            Amount: {amount} BTC
            Transaction ID: {tx_id}
            Destination Wallet: {self.btc_wallet}
            """
            
            msg = MIMEMultipart()
            msg['Subject'] = subject
            msg['To'] = self.report_email
            msg.attach(MIMEText(body, 'plain'))
            
            # Send email using configured SMTP
            with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
                smtp.starttls()
                smtp.send_message(msg)
                
            logger.info(f"Profit report sent to {self.report_email}")
            
        except Exception as e:
            logger.error(f"Error sending profit report: {str(e)}")
            raise
