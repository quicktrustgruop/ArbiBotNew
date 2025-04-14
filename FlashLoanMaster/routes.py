from flask import render_template, jsonify, request, flash, redirect, url_for
from app import app, db
from models import ArbitrageOpportunity, Transaction, CloudMiningStatus, BotStatus
from arbitrage_scanner import iniciar_escaneamento
from blockchain_connector import BlockchainConnector
from risk_manager import apply_risk_management
from datetime import datetime
import logging
import json

logger = logging.getLogger(__name__)

# Add global context processor for all templates
@app.context_processor
def inject_now():
    return {'now': datetime.now()}

@app.route('/')
def dashboard():
    """Render the main dashboard page."""
    try:
        # Get the latest bot status
        bot_status = BotStatus.query.order_by(BotStatus.timestamp.desc()).first()

        # Get mining stats
        mining_status = CloudMiningStatus.query.order_by(CloudMiningStatus.timestamp.desc()).first()

        # Get latest arbitrage opportunities
        opportunities = ArbitrageOpportunity.query.order_by(ArbitrageOpportunity.timestamp.desc()).limit(10).all()

        # Get transaction statistics
        total_transactions = Transaction.query.count()
        successful_transactions = Transaction.query.filter_by(status='successful').count()
        failed_transactions = Transaction.query.filter_by(status='failed').count()

        return render_template('dashboard.html', 
                               bot_status=bot_status,
                               mining_status=mining_status,
                               opportunities=opportunities,
                               total_transactions=total_transactions,
                               successful_transactions=successful_transactions,
                               failed_transactions=failed_transactions)
    except Exception as e:
        logger.error(f"Error loading dashboard: {e}")
        flash(f"Error loading dashboard: {e}", "danger")
        return render_template('dashboard.html', error=str(e))

@app.route('/transactions')
def transactions():
    """Render the transactions page."""
    try:
        transactions = Transaction.query.order_by(Transaction.timestamp.desc()).all()
        return render_template('transactions.html', transactions=transactions)
    except Exception as e:
        logger.error(f"Error loading transactions: {e}")
        flash(f"Error loading transactions: {e}", "danger")
        return render_template('transactions.html', error=str(e))

@app.route('/opportunities')
def opportunities():
    """Render the opportunities page."""
    try:
        opportunities = ArbitrageOpportunity.query.order_by(ArbitrageOpportunity.timestamp.desc()).all()
        return render_template('opportunities.html', opportunities=opportunities)
    except Exception as e:
        logger.error(f"Error loading opportunities: {e}")
        flash(f"Error loading opportunities: {e}", "danger")
        return render_template('opportunities.html', error=str(e))

@app.route('/settings')
def settings():
    """Render the settings page."""
    try:
        return render_template('settings.html')
    except Exception as e:
        logger.error(f"Error loading settings page: {e}")
        flash(f"Error loading settings page: {e}", "danger")
        return render_template('settings.html', error=str(e))

@app.route('/about')
def about():
    """Render the about page."""
    try:
        return render_template('about.html')
    except Exception as e:
        logger.error(f"Error loading about page: {e}")
        flash(f"Error loading about page: {e}", "danger")
        return render_template('about.html', error=str(e))

@app.route('/api/scan', methods=['POST'])
def scan_now():
    """Manually trigger a scan for arbitrage opportunities."""
    try:
        logger.info("Manual scan initiated")
        opportunities = iniciar_escaneamento()
        filtered_opportunities = apply_risk_management(opportunities)

        # Return the results as JSON
        return jsonify({
            'status': 'success',
            'message': f'Scan completed. Found {len(opportunities)} opportunities, {len(filtered_opportunities)} passed risk assessment.',
            'opportunities': [opp.to_dict() for opp in filtered_opportunities]
        })
    except Exception as e:
        logger.error(f"Error during manual scan: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error during scan: {str(e)}'
        }), 500

@app.route('/api/bot/toggle', methods=['POST'])
def toggle_bot():
    """Toggle the bot's active status."""
    try:
        data = request.get_json()
        active = data.get('active', False)

        # Update the bot status
        new_status = BotStatus(active=active, timestamp=datetime.now())
        db.session.add(new_status)
        db.session.commit()

        logger.info(f"Bot status toggled: active={active}")

        return jsonify({
            'status': 'success',
            'message': f'Bot {"activated" if active else "deactivated"} successfully',
            'botActive': active
        })
    except Exception as e:
        logger.error(f"Error toggling bot status: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error toggling bot status: {str(e)}'
        }), 500

@app.route('/api/mining/stats')
def mining_stats():
    """Get the latest mining statistics."""
    try:
        mining_status = CloudMiningStatus.query.order_by(CloudMiningStatus.timestamp.desc()).first()

        if mining_status:
            return jsonify({
                'status': 'success',
                'data': mining_status.to_dict()
            })
        else:
            return jsonify({
                'status': 'warning',
                'message': 'No mining data available yet'
            })
    except Exception as e:
        logger.error(f"Error fetching mining stats: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error fetching mining stats: {str(e)}'
        }), 500

@app.route('/api/opportunities')
def get_opportunities():
    """Get the latest arbitrage opportunities."""
    try:
        opportunities = ArbitrageOpportunity.query.order_by(ArbitrageOpportunity.timestamp.desc()).limit(20).all()

        return jsonify({
            'status': 'success',
            'data': [opp.to_dict() for opp in opportunities]
        })
    except Exception as e:
        logger.error(f"Error fetching opportunities: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error fetching opportunities: {str(e)}'
        }), 500

@app.route('/api/transactions')
def get_transactions():
    """Get the latest transactions."""
    try:
        transactions = Transaction.query.order_by(Transaction.timestamp.desc()).limit(20).all()

        if not transactions:
            return jsonify({
                'status': 'success',
                'data': [],
                'message': 'No transactions found'
            })

        return jsonify({
            'status': 'success',
            'data': [tx.to_dict() for tx in transactions]
        })
    except Exception as e:
        logger.error(f"Error fetching transactions: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Error fetching transactions'
        }), 500

# Assuming these functions are defined elsewhere and handle database interactions appropriately.
def check_network_connections(blockchain_connector):
    pass

def update_bot_status():
    pass

def generate_mining_stats():
    pass

# Example of how to use app context in a scheduled task (requires a scheduler like APScheduler)
# from apscheduler.schedulers.background import BackgroundScheduler
# scheduler = BackgroundScheduler()
# scheduler.add_job(lambda: with app.app_context(): iniciar_escaneamento(), 'interval', seconds=60)
# scheduler.start()