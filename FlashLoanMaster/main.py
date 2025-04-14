
from app import app
import os
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from flask import render_template

# Configure logging
logging.basicConfig(level=logging.DEBUG, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import configurations
from config import (
    PRIVATE_KEY, ALCHEMY_API_KEY, INFURA_API_KEY,
    BINANCE_API_KEY, BINANCE_API_SECRET,
    KUCOIN_API_KEY, KUCOIN_API_SECRET,
    KRAKEN_API_KEY, KRAKEN_API_SECRET,
    MEXC_API_KEY, MEXC_API_SECRET,
    GATEIO_API_KEY, GATEIO_API_SECRET,
    BYBIT_API_KEY, BYBIT_API_SECRET,
    COINBASE_API_KEY, COINBASE_API_SECRET,
    BITGET_API_KEY, BITGET_API_SECRET,
    MERCADO_PAGO_API_KEY, MERCADO_PAGO_TOKEN,
    SESSION_SECRET
)

# Set environment variables
os.environ.update({
    'PRIVATE_KEY': PRIVATE_KEY,
    'ALCHEMY_API': ALCHEMY_API_KEY,
    'INFURA_API_KEY': INFURA_API_KEY,
    'BINANCE_API_KEY': BINANCE_API_KEY,
    'BINANCE_API_SECRET': BINANCE_API_SECRET,
    'KUCOIN_API_KEY': KUCOIN_API_KEY,
    'KUCOIN_API_SECRET': KUCOIN_API_SECRET,
    'KRAKEN_API_KEY': KRAKEN_API_KEY,
    'KRAKEN_API_SECRET': KRAKEN_API_SECRET,
    'MEXC_API_KEY': MEXC_API_KEY,
    'MEXC_API_SECRET': MEXC_API_SECRET,
    'GATEIO_API_KEY': GATEIO_API_KEY,
    'GATEIO_API_SECRET': GATEIO_API_SECRET,
    'BYBIT_API_KEY': BYBIT_API_KEY,
    'BYBIT_API_SECRET': BYBIT_API_SECRET,
    'COINBASE_API_KEY': COINBASE_API_KEY,
    'COINBASE_API_SECRET': COINBASE_API_SECRET or "",
    'BITGET_API_KEY': BITGET_API_KEY,
    'BITGET_API_SECRET': BITGET_API_SECRET,
    'MERCADO_PAGO_API_KEY': MERCADO_PAGO_API_KEY,
    'MERCADO_PAGO_TOKEN': MERCADO_PAGO_TOKEN,
    'SESSION_SECRET': SESSION_SECRET
})

# Initialize database
from utils import initialize_database
from ai_error_prevention import ai_prevention
with app.app_context():
    initialize_database()

# Import modules after database initialization
from arbitrage_scanner import iniciar_escaneamento
from risk_manager import apply_risk_management
from blockchain_connector import BlockchainConnector, check_network_connections
from utils import update_bot_status, generate_mining_stats, scheduled_tasks
from profit_handler import ProfitHandler

# Initialize components
blockchain_connector = BlockchainConnector()
profit_handler = ProfitHandler()

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(lambda: iniciar_escaneamento(), 'interval', seconds=30)
scheduler.add_job(lambda: check_network_connections(blockchain_connector), 'interval', seconds=45)
scheduler.add_job(lambda: update_bot_status(), 'interval', seconds=60)
scheduler.add_job(lambda: generate_mining_stats(), 'interval', minutes=5)
scheduler.add_job(lambda: scheduled_tasks(), 'interval', minutes=30)
scheduler.start()

# Execute initial jobs
with app.app_context():
    iniciar_escaneamento()
    check_network_connections(blockchain_connector)
    update_bot_status()
    generate_mining_stats()

# Import routes after app initialization
from routes import *

if __name__ == "__main__":
    try:
        # Start AI error prevention system
        ai_prevention.start_monitoring()
        
        # Configure reasonable number of workers
        workers = min(os.cpu_count() * 2 + 1, 16)  # More realistic worker count
        app.config['WORKERS'] = workers
        
        # Initialize monitoring
        logger.info(f"Starting application with {workers} workers")
        logger.info("AI error prevention system activated")
    
    # Run with gunicorn for production
    from gunicorn.app.base import BaseApplication

    class StandaloneApplication(BaseApplication):
        def __init__(self, app, options=None):
            self.options = options or {}
            self.application = app
            super().__init__()

        def load_config(self):
            for key, value in self.options.items():
                self.cfg.set(key, value)

        def load(self):
            return self.application

    options = {
        'bind': '0.0.0.0:5000',
        'workers': workers,
        'timeout': 120,
        'worker_class': 'sync',
        'preload_app': True
    }

    StandaloneApplication(app, options).run()
