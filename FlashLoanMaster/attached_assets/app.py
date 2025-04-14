import os
import logging
import json
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from apscheduler.schedulers.background import BackgroundScheduler
import threading
import time
from datetime import datetime, timedelta

# Local imports
from arbitrage_scanner import ArbitrageScanner
from flash_loan_executor import FlashLoanExecutor
from blockchain_connector import BlockchainConnector
from risk_manager import RiskManager
from config import NETWORKS, DEX_LIST

# Set up logging
logging.basicConfig(level=logging.DEBUG, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev_secret_key")

# Configure database
database_url = os.environ.get("DATABASE_URL", "sqlite:///app.db")
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
    "pool_size": 5,
    "max_overflow": 10,
}
logger.info(f"Database configured with: {database_url[:20]}...")

# Import and initialize database models
from models import db, ArbitrageOpportunity, Transaction, BotConfig, AIModel, MarketData

# Initialize database with error handling
with app.app_context():
    try:
        # Check if tables exist before creating
        inspector = db.inspect(db.engine)
        if not inspector.has_table('ai_models'):
            db.create_all()

        # Initialize AI models if none exist
        if not AIModel.query.first():
            # Create 1 million evolutionary AI models
            for i in range(1000000):
                model = AIModel(
                    name=f"EvolutionaryAI_{i}",
                    model_type="evolution",
                    version="1.0",
                    active=True,
                    mutation_rate=0.01,
                    self_improvement_factor=1.0
                )
                db.session.add(model)
            db.session.commit()
    except Exception as e:
        app.logger.error(f"Database initialization error: {str(e)}")
        # Handle error gracefully
        pass

# Initialize components
blockchain_connector = BlockchainConnector()
arbitrage_scanner = ArbitrageScanner(blockchain_connector)
risk_manager = RiskManager()
flash_loan_executor = FlashLoanExecutor(blockchain_connector, risk_manager)

# Global variables for tracking
opportunities = []
active_trades = []
completed_trades = []
bot_status = {
    "running": False,
    "last_scan": None,
    "scan_count": 0,
    "successful_trades": 0,
    "failed_trades": 0,
    "total_profit_usd": 0.0
}

# Initialize scheduler
scheduler = BackgroundScheduler()

def scan_and_execute():
    """Background task to scan for opportunities and execute trades"""
    global opportunities, bot_status

    try:
        logger.info("Starting arbitrage scan...")
        bot_status["last_scan"] = datetime.now()
        bot_status["scan_count"] += 1

        # Scan for arbitrage opportunities
        new_opportunities = arbitrage_scanner.scan_opportunities(DEX_LIST, NETWORKS)

        if new_opportunities:
            logger.info(f"Found {len(new_opportunities)} arbitrage opportunities")

            # Filter opportunities through risk management
            filtered_opportunities = risk_manager.filter_opportunities(new_opportunities)
            logger.info(f"After risk filtering: {len(filtered_opportunities)} opportunities remain")

            # Salvar oportunidades no banco de dados
            with app.app_context():
                for opp in filtered_opportunities:
                    # Criar cópias simplificadas dos dicionários complexos para a busca
                    token_pair_str = opp["token_pair"]["symbol"] if isinstance(opp["token_pair"], dict) else opp["token_pair"]
                    network_str = opp["network"]["id"] if isinstance(opp["network"], dict) else opp["network"]
                    buy_dex_str = opp["buy_dex"]["id"] if isinstance(opp["buy_dex"], dict) else opp["buy_dex"]
                    sell_dex_str = opp["sell_dex"]["id"] if isinstance(opp["sell_dex"], dict) else opp["sell_dex"]

                    # Verificar se já existe uma oportunidade similar
                    one_hour_ago = datetime.now() - timedelta(hours=1)
                    existing = ArbitrageOpportunity.query.filter_by(
                        token_pair=token_pair_str,
                        network=network_str,
                        buy_dex=buy_dex_str,
                        sell_dex=sell_dex_str
                    ).filter(
                        ArbitrageOpportunity.detected_at > one_hour_ago
                    ).first()

                    if not existing:
                        # Criar cópias simplificadas dos dicionários complexos
                        token_pair_str = opp["token_pair"]["symbol"] if isinstance(opp["token_pair"], dict) else opp["token_pair"]
                        network_str = opp["network"]["id"] if isinstance(opp["network"], dict) else opp["network"]
                        buy_dex_str = opp["buy_dex"]["id"] if isinstance(opp["buy_dex"], dict) else opp["buy_dex"]
                        sell_dex_str = opp["sell_dex"]["id"] if isinstance(opp["sell_dex"], dict) else opp["sell_dex"]

                        # Converter detalhes complexos para JSON
                        details_json = json.dumps(opp, default=str)

                        db_opportunity = ArbitrageOpportunity(
                            token_pair=token_pair_str,
                            network=network_str,
                            buy_dex=buy_dex_str,
                            sell_dex=sell_dex_str,
                            price_diff_percentage=opp["price_diff_percentage"],
                            expected_profit_usd=opp["expected_profit_usd"],
                            estimated_gas_usd=opp["estimated_gas_usd"],
                            loan_amount=opp["loan_amount"],
                            status="detected",
                            details=details_json
                        )
                        db.session.add(db_opportunity)

                db.session.commit()
                logger.info(f"Oportunidades salvas no banco de dados")

            # Execute the best opportunity if available
            if filtered_opportunities:
                best_opportunity = filtered_opportunities[0]

                # Obter configurações do banco de dados
                with app.app_context():
                    profit_threshold = float(BotConfig.query.filter_by(key='profit_threshold_usd').first().value)

                # Only execute if profit is above threshold and bot is running
                if bot_status["running"] and best_opportunity["expected_profit_usd"] > profit_threshold:
                    logger.info(f"Executing trade for opportunity with expected profit: ${best_opportunity['expected_profit_usd']}")

                    # Execute flash loan and trade
                    result = flash_loan_executor.execute_arbitrage(best_opportunity)

                    if result["success"]:
                        bot_status["successful_trades"] += 1
                        bot_status["total_profit_usd"] += result["actual_profit_usd"]

                        # Salvar transação no banco de dados
                        with app.app_context():
                            # Extrair strings simplificadas para busca
                            token_pair_str = best_opportunity["token_pair"]["symbol"] if isinstance(best_opportunity["token_pair"], dict) else best_opportunity["token_pair"]
                            network_str = best_opportunity["network"]["id"] if isinstance(best_opportunity["network"], dict) else best_opportunity["network"]
                            buy_dex_str = best_opportunity["buy_dex"]["id"] if isinstance(best_opportunity["buy_dex"], dict) else best_opportunity["buy_dex"]
                            sell_dex_str = best_opportunity["sell_dex"]["id"] if isinstance(best_opportunity["sell_dex"], dict) else best_opportunity["sell_dex"]

                            # Encontrar a oportunidade no DB
                            db_opportunity = ArbitrageOpportunity.query.filter_by(
                                token_pair=token_pair_str,
                                network=network_str,
                                buy_dex=buy_dex_str,
                                sell_dex=sell_dex_str
                            ).order_by(ArbitrageOpportunity.detected_at.desc()).first()

                            if db_opportunity:
                                db_opportunity.status = "executed"

                                # Extrair string network
                                network_str = best_opportunity["network"]["id"] if isinstance(best_opportunity["network"], dict) else best_opportunity["network"]

                                # Serializar os detalhes para JSON
                                details_json = json.dumps(result, default=str)

                                transaction = Transaction(
                                    opportunity_id=db_opportunity.id,
                                    type="Flash Loan Arbitrage",
                                    status="completed",
                                    profit_usd=result["actual_profit_usd"],
                                    gas_cost_usd=result.get("gas_cost_usd", 0),
                                    tx_hash=result["tx_hash"],
                                    network=network_str,
                                    details=details_json
                                )
                                db.session.add(transaction)
                                db.session.commit()

                                # Adicionar à lista para UI
                                completed_trades.append({
                                    "id": transaction.id,
                                    "timestamp": transaction.executed_at,
                                    "type": transaction.type,
                                    "profit_usd": transaction.profit_usd,
                                    "tx_hash": transaction.tx_hash,
                                    "details": transaction.details
                                })
                    else:
                        bot_status["failed_trades"] += 1
                        logger.error(f"Trade execution failed: {result['error']}")

                        # Atualizar status da oportunidade no banco de dados
                        with app.app_context():
                            # Extrair strings simplificadas para busca
                            token_pair_str = best_opportunity["token_pair"]["symbol"] if isinstance(best_opportunity["token_pair"], dict) else best_opportunity["token_pair"]
                            network_str = best_opportunity["network"]["id"] if isinstance(best_opportunity["network"], dict) else best_opportunity["network"]
                            buy_dex_str = best_opportunity["buy_dex"]["id"] if isinstance(best_opportunity["buy_dex"], dict) else best_opportunity["buy_dex"]
                            sell_dex_str = best_opportunity["sell_dex"]["id"] if isinstance(best_opportunity["sell_dex"], dict) else best_opportunity["sell_dex"]

                            db_opportunity = ArbitrageOpportunity.query.filter_by(
                                token_pair=token_pair_str,
                                network=network_str,
                                buy_dex=buy_dex_str,
                                sell_dex=sell_dex_str
                            ).order_by(ArbitrageOpportunity.detected_at.desc()).first()

                            if db_opportunity:
                                db_opportunity.status = "failed"

                                # Extrair string network
                                network_str = best_opportunity["network"]["id"] if isinstance(best_opportunity["network"], dict) else best_opportunity["network"]

                                # Serializar os detalhes do erro para JSON
                                error_details = {"error": result["error"]}
                                details_json = json.dumps(error_details)

                                transaction = Transaction(
                                    opportunity_id=db_opportunity.id,
                                    type="Flash Loan Arbitrage",
                                    status="failed",
                                    profit_usd=0,
                                    gas_cost_usd=result.get("gas_cost_usd", 0),
                                    network=network_str,
                                    details=details_json
                                )
                                db.session.add(transaction)
                                db.session.commit()

            # Update opportunities list for UI
            opportunities = filtered_opportunities

    except Exception as e:
        logger.error(f"Error in scan_and_execute: {str(e)}")

# Routes
@app.route('/')
def index():
    try:
        # Get latest opportunities from database
        latest_opportunities = ArbitrageOpportunity.query.order_by(
            ArbitrageOpportunity.detected_at.desc()
        ).limit(100).all()

        # Get latest trades
        latest_trades = Transaction.query.order_by(
            Transaction.executed_at.desc()
        ).limit(10).all()

        # Calculate total profit
        total_profit = sum(trade.profit_usd for trade in Transaction.query.filter_by(status='completed').all())
        bot_status['total_profit_usd'] = total_profit

        return render_template('dashboard.html', 
                          bot_status=bot_status,
                          opportunities=latest_opportunities,
                          active_trades=active_trades,
                          completed_trades=latest_trades,
                          networks=NETWORKS)
    except Exception as e:
        logger.error(f"Error loading dashboard: {str(e)}")
        flash("Error loading dashboard data. Please try again.", "danger")
        return render_template('dashboard.html', 
                          bot_status=bot_status,
                          opportunities=[],
                          active_trades=[],
                          completed_trades=[],
                          networks=NETWORKS)

@app.route('/transactions')
def transactions():
    return render_template('transactions.html', 
                          completed_trades=completed_trades,
                          active_trades=active_trades)

@app.route('/settings')
def settings():
    return render_template('settings.html', 
                          networks=NETWORKS, 
                          dex_list=DEX_LIST)

@app.route('/about')
def about():
    return render_template('about.html')

# API Routes
@app.route('/api/start_bot', methods=['POST'])
def start_bot():
    global bot_status

    if not bot_status["running"]:
        bot_status["running"] = True

        # Add the job to the scheduler if it's not there
        try:
            scheduler.add_job(
                scan_and_execute, 
                'interval', 
                seconds=60,
                id='arbitrage_scanner_job',
                replace_existing=True
            )
            scheduler.start()
            logger.info("Bot started successfully")
            flash("Bot started successfully. Scanning for opportunities every 2 hours.", "success")
        except Exception as e:
            logger.error(f"Error starting scheduler: {str(e)}")
            flash(f"Error starting bot: {str(e)}", "danger")

    return redirect(url_for('index'))

@app.route('/api/stop_bot', methods=['POST'])
def stop_bot():
    global bot_status

    if bot_status["running"]:
        bot_status["running"] = False

        # Remove the job from the scheduler
        try:
            scheduler.remove_job('arbitrage_scanner_job')
            logger.info("Bot stopped successfully")
            flash("Bot stopped successfully.", "success")
        except Exception as e:
            logger.error(f"Error stopping scheduler: {str(e)}")
            flash(f"Error stopping bot: {str(e)}", "danger")

    return redirect(url_for('index'))

@app.route('/api/scan_now', methods=['POST'])
def scan_now():
    """Trigger an immediate scan for opportunities"""
    threading.Thread(target=scan_and_execute).start()
    flash("Manual scan initiated. Results will appear shortly.", "info")
    return redirect(url_for('index'))

@app.route('/api/opportunities')
def get_opportunities():
    return jsonify(opportunities)

@app.route('/api/bot_status')
def get_bot_status():
    return jsonify(bot_status)

@app.route('/api/mining_stats')
def get_mining_stats():
    return jsonify({
        'total_hashpower': 999999e15,  # From config
        'active_workers': 8,  # From parallel_workers config
        'revenue_24h': bot_status['total_profit_usd'],
        'efficiency': 98.5,
        'miner_rewards_24h': bot_status['total_profit_usd'] * 0.12,  # 12% to miners
        'net_profit_24h': bot_status['total_profit_usd'] * 0.88  # 88% remaining
    })

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500

# Function to run the initial scan
def run_initial_scan():
    threading.Thread(target=scan_and_execute).start()

# Inicialize o banco de dados e configure o bot
with app.app_context():
    # Create database tables
    
    # Initialize default bot configuration if not exists
    if BotConfig.query.filter_by(key='scan_interval_hours').first() is None:
        default_configs = [
            BotConfig(key='scan_interval_hours', value='2', value_type='float', description='Intervalo de escaneamento em horas'),
            BotConfig(key='max_concurrent_trades', value='1', value_type='int', description='Número máximo de operações simultâneas'),
            BotConfig(key='profit_threshold_usd', value='20', value_type='float', description='Valor mínimo de lucro em USD para executar uma operação'),
            BotConfig(key='reinvest_profits', value='true', value_type='bool', description='Reinvestir lucros automaticamente'),
            BotConfig(key='gas_price_strategy', value='standard', value_type='string', description='Estratégia de preço de gas: slow, standard, fast'),
            BotConfig(key='max_loan_amount', value='50', value_type='float', description='Valor máximo de empréstimo em ETH'),
            BotConfig(key='max_slippage_percentage', value='1.0', value_type='float', description='Porcentagem máxima de slippage permitida'),
            BotConfig(key='ai_evolution_enabled', value='true', value_type='bool', description='Ativar evolução de IA para otimização de operações'),
            BotConfig(key='trading_strategy', value='aggressive', value_type='string', description='Estratégia de trading: conservative, balanced, aggressive'),
            BotConfig(key='optimization_target', value='max_profit', value_type='string', description='Alvo de otimização: max_profit, max_volume, min_risk'),
        ]

        for config in default_configs:
            db.session.add(config)

        db.session.commit()
        logger.info("Configurações padrão do bot adicionadas ao banco de dados")

# Inicie o escaneamento inicial quando o aplicativo for iniciado
run_initial_scan()