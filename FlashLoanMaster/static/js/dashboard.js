/**
 * Dashboard.js - Handles dashboard functionality for the crypto arbitrage bot
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initDashboard();
    
    // Setup event listeners
    setupEventListeners();
    
    // Set up recurring data refresh
    setInterval(refreshDashboardData, 30000); // Refresh every 30 seconds
});

/**
 * Initialize the dashboard
 */
function initDashboard() {
    console.log('Initializing dashboard...');
    
    // Load initial data
    refreshDashboardData();
    
    // Initialize charts
    initCharts();
    
    // Check bot status and update UI
    updateBotStatusUI();
}

/**
 * Setup event listeners for dashboard interactions
 */
function setupEventListeners() {
    // Toggle bot status button
    const botToggleBtn = document.getElementById('bot-toggle');
    if (botToggleBtn) {
        botToggleBtn.addEventListener('click', toggleBotStatus);
    }
    
    // Scan for opportunities button
    const scanNowBtn = document.getElementById('scan-now');
    if (scanNowBtn) {
        scanNowBtn.addEventListener('click', triggerManualScan);
    }
}

/**
 * Refresh all dashboard data
 */
function refreshDashboardData() {
    console.log('Refreshing dashboard data...');
    
    Promise.all([
        fetchOpportunities().catch(err => {
            console.error('Error fetching opportunities:', err);
            showNotification('Failed to fetch opportunities', 'error');
        }),
        fetchMiningStats().catch(err => {
            console.error('Error fetching mining stats:', err);
            showNotification('Failed to fetch mining stats', 'error');
        }),
        fetchLatestTransactions().catch(err => {
            console.error('Error fetching transactions:', err);
            showNotification('Failed to fetch transactions', 'error');
        })
    ]).then(() => {
        updateTimeSinceLastScan();
        console.log('Dashboard refresh complete');
    });
}

// Add auto-retry for failed API calls
function fetchWithRetry(url, options = {}, retries = 3) {
    return fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            if (retries > 0) {
                return new Promise(resolve => setTimeout(resolve, 1000))
                    .then(() => fetchWithRetry(url, options, retries - 1));
            }
            throw error;
        });
}

/**
 * Fetch latest arbitrage opportunities
 */
function fetchOpportunities() {
    fetch('/api/opportunities')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                updateOpportunitiesUI(data.data);
            } else {
                console.error('Error fetching opportunities:', data.message);
                showNotification('Error fetching opportunities', 'error');
            }
        })
        .catch(error => {
            console.error('Failed to fetch opportunities:', error);
            showNotification('Failed to fetch opportunities', 'error');
        });
}

/**
 * Fetch mining statistics
 */
function fetchMiningStats() {
    fetch('/api/mining/stats')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                updateMiningStatsUI(data.data);
            } else if (data.status === 'warning') {
                console.warn('Mining stats warning:', data.message);
            } else {
                console.error('Error fetching mining stats:', data.message);
            }
        })
        .catch(error => {
            console.error('Failed to fetch mining stats:', error);
        });
}

/**
 * Fetch latest transactions
 */
function fetchLatestTransactions() {
    fetch('/api/transactions')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                updateTransactionsUI(data.data);
            } else {
                console.error('Error fetching transactions:', data.message);
            }
        })
        .catch(error => {
            console.error('Failed to fetch transactions:', error);
        });
}

/**
 * Update opportunities table in the UI
 */
function updateOpportunitiesUI(opportunities) {
    const opportunitiesTable = document.getElementById('opportunities-table');
    if (!opportunitiesTable) return;
    
    const tbody = opportunitiesTable.querySelector('tbody');
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    if (opportunities.length === 0) {
        // Show empty state
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No arbitrage opportunities found</td>
            </tr>
        `;
        return;
    }
    
    // Add opportunities to the table
    opportunities.forEach(opportunity => {
        const row = document.createElement('tr');
        
        // Format the timestamp
        const timestamp = new Date(opportunity.timestamp);
        const formattedTime = timestamp.toLocaleString();
        
        // Determine status class
        let statusClass = 'info';
        if (opportunity.status === 'executed') {
            statusClass = 'success';
        } else if (opportunity.status === 'failed') {
            statusClass = 'danger';
        } else if (opportunity.status === 'processing') {
            statusClass = 'warning';
        }
        
        row.innerHTML = `
            <td>${opportunity.network}</td>
            <td>${opportunity.token_pair}</td>
            <td>${opportunity.buy_dex} → ${opportunity.sell_dex}</td>
            <td>${opportunity.price_difference_percent.toFixed(2)}%</td>
            <td>$${opportunity.expected_profit.toFixed(2)}</td>
            <td><span class="status-pill ${statusClass}">${opportunity.status}</span></td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Update opportunities counter
    const opportunitiesCounter = document.getElementById('opportunities-count');
    if (opportunitiesCounter) {
        opportunitiesCounter.textContent = opportunities.length;
    }
}

/**
 * Update mining statistics in the UI
 */
function updateMiningStatsUI(stats) {
    // Update mining status indicators
    document.getElementById('mining-status').textContent = stats.active ? 'Active' : 'Inactive';
    document.getElementById('mining-status').className = stats.active ? 'text-success' : 'text-danger';
    
    document.getElementById('hash-power').textContent = `${stats.total_hash_power.toFixed(2)} TH/s`;
    document.getElementById('active-workers').textContent = stats.active_workers;
    document.getElementById('mining-revenue').textContent = `$${stats.mining_revenue_24h.toFixed(2)}`;
    document.getElementById('mining-efficiency').textContent = `${stats.efficiency.toFixed(0)}%`;
    document.getElementById('total-profit').textContent = `$${stats.total_profit.toFixed(2)}`;
    
    // Update efficiency progress bar
    const efficiencyBar = document.getElementById('efficiency-bar');
    if (efficiencyBar) {
        efficiencyBar.style.width = `${stats.efficiency}%`;
        
        // Update class based on efficiency
        efficiencyBar.className = 'progress-bar';
        if (stats.efficiency >= 75) {
            efficiencyBar.classList.add('success');
        } else if (stats.efficiency >= 40) {
            efficiencyBar.classList.add('warning');
        } else {
            efficiencyBar.classList.add('danger');
        }
    }
}

/**
 * Update transactions in the UI
 */
function updateTransactionsUI(transactions) {
    const transactionsTable = document.getElementById('transactions-table');
    if (!transactionsTable) return;
    
    const tbody = transactionsTable.querySelector('tbody');
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    if (transactions.length === 0) {
        // Show empty state
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No transactions executed yet</td>
            </tr>
        `;
        return;
    }
    
    // Add transactions to the table
    transactions.slice(0, 5).forEach(tx => {
        const row = document.createElement('tr');
        
        // Format the timestamp
        const timestamp = new Date(tx.timestamp);
        const formattedTime = timestamp.toLocaleString();
        
        // Determine status class
        let statusClass = 'info';
        if (tx.status === 'successful') {
            statusClass = 'success';
        } else if (tx.status === 'failed') {
            statusClass = 'danger';
        } else if (tx.status === 'processing') {
            statusClass = 'warning';
        }
        
        row.innerHTML = `
            <td>${tx.network}</td>
            <td>${tx.token_pair}</td>
            <td>$${tx.net_profit.toFixed(2)}</td>
            <td>${formattedTime}</td>
            <td><span class="status-pill ${statusClass}">${tx.status}</span></td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Update transaction counters
    const successfulTxCounter = document.getElementById('successful-tx-count');
    const failedTxCounter = document.getElementById('failed-tx-count');
    
    if (successfulTxCounter) {
        const successfulCount = transactions.filter(tx => tx.status === 'successful').length;
        successfulTxCounter.textContent = successfulCount;
    }
    
    if (failedTxCounter) {
        const failedCount = transactions.filter(tx => tx.status === 'failed').length;
        failedTxCounter.textContent = failedCount;
    }
}

/**
 * Initialize charts on the dashboard
 */
function initCharts() {
    initProfitChart();
    initNetworkDistributionChart();
}

/**
 * Initialize profit chart
 */
function initProfitChart() {
    const ctx = document.getElementById('profit-chart');
    if (!ctx) return;
    
    const profitChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['', '', '', '', '', '', ''],
            datasets: [{
                label: 'Profit (USD)',
                data: [0, 0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(108, 99, 255, 0.2)',
                borderColor: 'rgba(108, 99, 255, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(51, 51, 51, 0.3)'
                    },
                    ticks: {
                        color: '#b3b3b3'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(51, 51, 51, 0.3)'
                    },
                    ticks: {
                        color: '#b3b3b3'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#f5f5f5'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
    
    // Simulate data loading - this would be replaced with real data
    setTimeout(() => {
        updateProfitChart(profitChart);
    }, 1000);
    
    // Store reference for later updates
    window.profitChart = profitChart;
}

/**
 * Update profit chart with new data
 */
function updateProfitChart(chart) {
    fetch('/api/transactions')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const transactions = data.data;
                
                // Group by day
                const profitByDay = {};
                transactions.forEach(tx => {
                    const date = new Date(tx.timestamp);
                    const day = date.toISOString().split('T')[0];
                    
                    if (!profitByDay[day]) {
                        profitByDay[day] = 0;
                    }
                    
                    if (tx.status === 'successful') {
                        profitByDay[day] += tx.net_profit;
                    }
                });
                
                // Convert to arrays for chart
                const days = Object.keys(profitByDay).sort();
                const profits = days.map(day => profitByDay[day]);
                
                // Format dates for display
                const formattedDays = days.map(day => {
                    const date = new Date(day);
                    return date.toLocaleDateString();
                });
                
                // Update chart data
                chart.data.labels = formattedDays;
                chart.data.datasets[0].data = profits;
                chart.update();
            }
        })
        .catch(error => {
            console.error('Failed to fetch profit data:', error);
        });
}

/**
 * Initialize network distribution chart
 */
function initNetworkDistributionChart() {
    const ctx = document.getElementById('network-chart');
    if (!ctx) return;
    
    const networkChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Optimism'],
            datasets: [{
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    'rgba(108, 99, 255, 0.8)',
                    'rgba(255, 171, 0, 0.8)',
                    'rgba(0, 176, 255, 0.8)',
                    'rgba(0, 200, 83, 0.8)',
                    'rgba(255, 82, 82, 0.8)'
                ],
                borderColor: [
                    'rgba(108, 99, 255, 1)',
                    'rgba(255, 171, 0, 1)',
                    'rgba(0, 176, 255, 1)',
                    'rgba(0, 200, 83, 1)',
                    'rgba(255, 82, 82, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#f5f5f5'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${percentage}%`;
                        }
                    }
                }
            }
        }
    });
    
    // Simulate data loading - this would be replaced with real data
    setTimeout(() => {
        updateNetworkChart(networkChart);
    }, 1000);
    
    // Store reference for later updates
    window.networkChart = networkChart;
}

/**
 * Update network distribution chart with new data
 */
function updateNetworkChart(chart) {
    fetch('/api/opportunities')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const opportunities = data.data;
                
                // Count opportunities by network
                const networkCount = {
                    'ethereum': 0,
                    'bsc': 0,
                    'polygon': 0,
                    'arbitrum': 0,
                    'optimism': 0
                };
                
                opportunities.forEach(opp => {
                    if (networkCount.hasOwnProperty(opp.network.toLowerCase())) {
                        networkCount[opp.network.toLowerCase()]++;
                    }
                });
                
                // Update chart data
                chart.data.datasets[0].data = [
                    networkCount.ethereum,
                    networkCount.bsc,
                    networkCount.polygon,
                    networkCount.arbitrum,
                    networkCount.optimism
                ];
                
                chart.update();
            }
        })
        .catch(error => {
            console.error('Failed to fetch network data:', error);
        });
}

/**
 * Toggle bot active status
 */
function toggleBotStatus() {
    const botToggleBtn = document.getElementById('bot-toggle');
    const currentStatus = botToggleBtn.getAttribute('data-status') === 'active';
    const newStatus = !currentStatus;
    
    // Show loading state
    botToggleBtn.disabled = true;
    botToggleBtn.innerHTML = `<span class="loader"></span> ${newStatus ? 'Activating...' : 'Deactivating...'}`;
    
    // Make API call to toggle status
    fetch('/api/bot/toggle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Update UI
            botToggleBtn.setAttribute('data-status', newStatus ? 'active' : 'inactive');
            updateBotStatusUI();
            showNotification(`Bot ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
        } else {
            console.error('Error toggling bot status:', data.message);
            showNotification(data.message, 'error');
            // Revert to previous state
            botToggleBtn.setAttribute('data-status', currentStatus ? 'active' : 'inactive');
        }
    })
    .catch(error => {
        console.error('Failed to toggle bot status:', error);
        showNotification('Failed to toggle bot status', 'error');
        // Revert to previous state
        botToggleBtn.setAttribute('data-status', currentStatus ? 'active' : 'inactive');
    })
    .finally(() => {
        botToggleBtn.disabled = false;
        updateBotStatusUI();
    });
}

/**
 * Update bot status UI
 */
function updateBotStatusUI() {
    const botToggleBtn = document.getElementById('bot-toggle');
    if (!botToggleBtn) return;
    
    const botStatusIndicator = document.getElementById('bot-status');
    const isActive = botToggleBtn.getAttribute('data-status') === 'active';
    
    // Update status indicator
    if (botStatusIndicator) {
        botStatusIndicator.textContent = isActive ? 'Active' : 'Inactive';
        botStatusIndicator.className = isActive ? 'text-success' : 'text-danger';
    }
    
    // Update button text and style
    if (isActive) {
        botToggleBtn.textContent = 'Deactivate Bot';
        botToggleBtn.classList.remove('btn-success');
        botToggleBtn.classList.add('btn-danger');
    } else {
        botToggleBtn.textContent = 'Activate Bot';
        botToggleBtn.classList.remove('btn-danger');
        botToggleBtn.classList.add('btn-success');
    }
}

/**
 * Trigger a manual scan for arbitrage opportunities
 */
function triggerManualScan() {
    const scanButton = document.getElementById('scan-now');
    
    // Show loading state
    scanButton.disabled = true;
    scanButton.innerHTML = '<span class="loader"></span> Scanning...';
    
    // Make API call to trigger scan
    fetch('/api/scan', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showNotification(data.message, 'success');
            // Refresh dashboard data
            setTimeout(() => {
                refreshDashboardData();
            }, 1000);
        } else {
            console.error('Error during scan:', data.message);
            showNotification(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Failed to perform scan:', error);
        showNotification('Failed to perform scan', 'error');
    })
    .finally(() => {
        // Reset button
        scanButton.disabled = false;
        scanButton.innerHTML = '<i class="fa fa-search"></i> Scan Now';
    });
}

/**
 * Update time since last scan
 */
function updateTimeSinceLastScan() {
    const lastScanElement = document.getElementById('last-scan-time');
    if (!lastScanElement) return;
    
    const lastScanTime = lastScanElement.getAttribute('data-time');
    if (!lastScanTime) return;
    
    const lastScan = new Date(lastScanTime);
    const now = new Date();
    const timeDiff = Math.floor((now - lastScan) / 1000); // in seconds
    
    let timeString;
    if (timeDiff < 60) {
        timeString = `${timeDiff} seconds ago`;
    } else if (timeDiff < 3600) {
        const minutes = Math.floor(timeDiff / 60);
        timeString = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (timeDiff < 86400) {
        const hours = Math.floor(timeDiff / 3600);
        timeString = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(timeDiff / 86400);
        timeString = `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    lastScanElement.textContent = timeString;
}

/**
 * Show a notification
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to the document
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}
