/**
 * Dashboard JavaScript functionality for the Crypto Arbitrage Bot
 */

document.addEventListener('DOMContentLoaded', function() {
    // Setup for real-time updates
    setupRealTimeUpdates();
    
    // Initialize tooltips and popovers
    initTooltipsAndPopovers();
    
    // Setup event listeners
    setupEventListeners();

    // Log initialization
    console.log('Dashboard initialized successfully');
});

/**
 * Setup polling for real-time updates of dashboard data
 */
function setupRealTimeUpdates() {
    // Update mining stats
    setInterval(updateMiningStats, 10000); // Every 10 seconds
    
    // Poll for bot status updates every 30 seconds
    setInterval(function() {
        // Only fetch updates if the page is visible
        if (document.visibilityState === 'visible') {
            updateBotStatus();
            updateOpportunities();
        }
    }, 30000); // 30 seconds
}

/**
 * Fetch and update the bot status
 */
function updateBotStatus() {
    fetch('/api/bot_status')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Update status indicator
            const statusIndicator = document.querySelector('.status-indicator');
            if (statusIndicator) {
                if (data.running) {
                    statusIndicator.classList.add('active');
                } else {
                    statusIndicator.classList.remove('active');
                }
            }
            
            // Update status text
            const statusText = document.querySelector('h6 span');
            if (statusText) {
                if (data.running) {
                    statusText.textContent = 'Running';
                    statusText.classList.remove('text-danger');
                    statusText.classList.add('text-success');
                } else {
                    statusText.textContent = 'Stopped';
                    statusText.classList.remove('text-success');
                    statusText.classList.add('text-danger');
                }
            }
            
            // Update last scan time
            const lastScanElement = document.querySelector('small.text-muted');
            if (lastScanElement && data.last_scan) {
                const lastScanDate = new Date(data.last_scan);
                lastScanElement.textContent = `Last scan: ${lastScanDate.toLocaleString()}`;
            }
            
            // Update performance metrics
            updatePerformanceMetrics(data);
        })
        .catch(error => {
            console.error('Error fetching bot status:', error);
        });
}

/**
 * Update performance metrics on the dashboard
 */
function updatePerformanceMetrics(data) {
    // Total Profit
    const profitElement = document.querySelector('.text-info');
    if (profitElement) {
        profitElement.textContent = `$${data.total_profit_usd.toFixed(2)}`;
    }
    
    // Scan count
    const scanCountElement = document.querySelector('.text-primary');
    if (scanCountElement) {
        scanCountElement.textContent = data.scan_count;
    }
    
    // Successful trades
    const successfulTradesElement = document.querySelector('.text-success');
    if (successfulTradesElement) {
        successfulTradesElement.textContent = data.successful_trades;
    }
    
    // Failed trades
    const failedTradesElement = document.querySelector('.text-danger');
    if (failedTradesElement) {
        failedTradesElement.textContent = data.failed_trades;
    }
}

/**
 * Fetch and update the current arbitrage opportunities
 */
function updateOpportunities() {
    fetch('/api/opportunities')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const opportunitiesTable = document.querySelector('.card:nth-child(1) table tbody');
            const opportunitiesCount = document.querySelector('.card:nth-child(1) .badge');
            
            if (opportunitiesTable && opportunitiesCount) {
                // Update count badge
                opportunitiesCount.textContent = `${data.length} Found`;
                
                // Clear current rows
                opportunitiesTable.innerHTML = '';
                
                // Add new rows
                if (data.length > 0) {
                    data.forEach(opp => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${opp.token_pair.symbol}</td>
                            <td>${opp.network.name}</td>
                            <td>${opp.buy_dex.name}</td>
                            <td>${opp.sell_dex.name}</td>
                            <td class="text-success">${opp.price_diff_percentage.toFixed(2)}%</td>
                            <td class="text-info">$${opp.expected_profit_usd.toFixed(2)}</td>
                            <td class="text-warning">$${opp.estimated_gas_usd.toFixed(2)}</td>

/**
 * Update mining statistics
 */
function updateMiningStats() {
    fetch('/api/mining_stats')
        .then(response => response.json())
        .then(data => {
            const hashpower = (data.total_hashpower / 1e15).toFixed(2);
            document.getElementById('totalHashPower').textContent = `${hashpower} Quadrilhão TH/s`;
            document.getElementById('activeWorkers').textContent = data.active_workers;
            document.getElementById('miningRevenue').textContent = formatCurrency(data.revenue_24h);
            document.getElementById('miningEfficiency').textContent = `${data.efficiency.toFixed(1)}%`;
            
            // Atualizar informações de pagamento
            if(document.getElementById('minerRewards')) {
                document.getElementById('minerRewards').textContent = formatCurrency(data.miner_rewards_24h);
            }
            if(document.getElementById('netProfit')) {
                document.getElementById('netProfit').textContent = formatCurrency(data.net_profit_24h);
            }
        })
        .catch(error => console.error('Error fetching mining stats:', error));
}

// Atualizar stats a cada 5 segundos
setInterval(updateMiningStats, 5000);
updateMiningStats(); // Primeira atualização;
}

                        `;
                        opportunitiesTable.appendChild(row);
                    });
                } else {
                    // No opportunities found
                    const emptyRow = document.createElement('tr');
                    emptyRow.innerHTML = `
                        <td colspan="7" class="text-center">No arbitrage opportunities found</td>
                    `;
                    opportunitiesTable.appendChild(emptyRow);
                }
            }
        })
        .catch(error => {
            console.error('Error fetching opportunities:', error);
        });
}

/**
 * Initialize Bootstrap tooltips and popovers
 */
function initTooltipsAndPopovers() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

/**
 * Setup event listeners for interactive elements
 */
function setupEventListeners() {
    // Start bot button
    const startButton = document.querySelector('form[action="/api/start_bot"] button');
    if (startButton) {
        startButton.addEventListener('click', function(e) {
            startButton.disabled = true;
            startButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Starting...';
        });
    }
    
    // Stop bot button
    const stopButton = document.querySelector('form[action="/api/stop_bot"] button');
    if (stopButton) {
        stopButton.addEventListener('click', function(e) {
            stopButton.disabled = true;
            stopButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Stopping...';
        });
    }
    
    // Scan now button
    const scanButton = document.querySelector('form[action="/api/scan_now"] button');
    if (scanButton) {
        scanButton.addEventListener('click', function(e) {
            const originalText = scanButton.innerHTML;
            scanButton.disabled = true;
            scanButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Scanning...';
            
            // Re-enable after 5 seconds
            setTimeout(() => {
                scanButton.disabled = false;
                scanButton.innerHTML = originalText;
            }, 5000);
        });
    }
}

/**
 * Update the profit chart with new data
 * @param {Array} data - Array of profit data points
 */
function updateProfitChart(data) {
    const chart = Chart.getChart('profitChart');
    if (chart) {
        chart.data.datasets[0].data = data;
        chart.update();
    }
}

/**
 * Format currency values with proper separators and decimals
 * @param {number} amount - The amount to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @param {string} currency - Currency symbol (default: $)
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, decimals = 2, currency = '$') {
    return currency + amount.toFixed(decimals).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

/**
 * Format percentages with proper decimals and % sign
 * @param {number} value - The percentage value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
function formatPercentage(value, decimals = 2) {
    return value.toFixed(decimals) + '%';
}
