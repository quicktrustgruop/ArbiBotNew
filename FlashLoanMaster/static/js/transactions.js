/**
 * Transactions.js - Handles transactions page functionality
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize transactions page
    initTransactionsPage();
    
    // Set up recurring data refresh
    setInterval(loadTransactions, 60000); // Refresh every minute
});

/**
 * Initialize the transactions page
 */
function initTransactionsPage() {
    console.log('Initializing transactions page...');
    
    // Load transactions data
    loadTransactions();
    
    // Initialize filter events
    setupFilterEvents();
}

/**
 * Load transactions data from the API
 */
function loadTransactions() {
    // Show loading indicator
    const tableBody = document.querySelector('#transactions-table tbody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="loader"></div>
                    <p>Loading transactions...</p>
                </td>
            </tr>
        `;
    }
    
    // Fetch transactions from API
    fetch('/api/transactions')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                displayTransactions(data.data);
                initializeTransactionStats(data.data);
            } else {
                console.error('Error loading transactions:', data.message);
                if (tableBody) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="8" class="text-center text-danger">
                                Error loading transactions: ${data.message}
                            </td>
                        </tr>
                    `;
                }
            }
        })
        .catch(error => {
            console.error('Failed to load transactions:', error);
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center text-danger">
                            Failed to load transactions. Please try again later.
                        </td>
                    </tr>
                `;
            }
        });
}

/**
 * Display transactions in the table
 */
function displayTransactions(transactions) {
    const tableBody = document.querySelector('#transactions-table tbody');
    if (!tableBody) return;
    
    // Clear table body
    tableBody.innerHTML = '';
    
    // Check if there are any transactions
    if (!transactions || transactions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    No transactions found
                </td>
            </tr>
        `;
        return;
    }
    
    // Loop through transactions and create table rows
    transactions.forEach(tx => {
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
        
        // Calculate ROI
        const roi = tx.buy_amount > 0 ? ((tx.net_profit / tx.buy_amount) * 100).toFixed(2) : 'N/A';
        
        row.innerHTML = `
            <td>${tx.id}</td>
            <td>${tx.network}</td>
            <td>${tx.token_pair}</td>
            <td>${tx.buy_dex} → ${tx.sell_dex}</td>
            <td>$${tx.buy_amount.toFixed(2)}</td>
            <td>$${tx.gas_cost.toFixed(6)}</td>
            <td>$${tx.net_profit.toFixed(2)} <small>(${roi}%)</small></td>
            <td>${formattedTime}</td>
            <td><span class="status-pill ${statusClass}">${tx.status}</span></td>
            <td>
                ${tx.tx_hash ? `<a href="#" class="btn btn-sm btn-primary view-tx" data-tx-id="${tx.id}">View</a>` : ''}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to "View" buttons
    document.querySelectorAll('.view-tx').forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            const txId = button.getAttribute('data-tx-id');
            showTransactionDetails(txId, transactions);
        });
    });
}

/**
 * Show transaction details modal
 */
function showTransactionDetails(txId, transactions) {
    // Find the transaction
    const tx = transactions.find(t => t.id == txId);
    if (!tx) return;
    
    // Create modal element
    const modalElement = document.createElement('div');
    modalElement.className = 'modal fade';
    modalElement.id = 'txModal';
    
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
    
    // Calculate gas price in Gwei assuming a 21000 gas limit
    const gasPrice = tx.gas_cost > 0 ? (tx.gas_cost / 0.000021).toFixed(2) : 'N/A';
    
    modalElement.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Transaction #${tx.id} Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Transaction Information</h6>
                            <table class="table">
                                <tr>
                                    <th>Network:</th>
                                    <td>${tx.network}</td>
                                </tr>
                                <tr>
                                    <th>Token Pair:</th>
                                    <td>${tx.token_pair}</td>
                                </tr>
                                <tr>
                                    <th>Buy DEX:</th>
                                    <td>${tx.buy_dex}</td>
                                </tr>
                                <tr>
                                    <th>Sell DEX:</th>
                                    <td>${tx.sell_dex}</td>
                                </tr>
                                <tr>
                                    <th>Timestamp:</th>
                                    <td>${formattedTime}</td>
                                </tr>
                                <tr>
                                    <th>Status:</th>
                                    <td><span class="status-pill ${statusClass}">${tx.status}</span></td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6>Financial Details</h6>
                            <table class="table">
                                <tr>
                                    <th>Buy Amount:</th>
                                    <td>$${tx.buy_amount.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <th>Sell Amount:</th>
                                    <td>$${tx.sell_amount.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <th>Gross Profit:</th>
                                    <td>$${tx.profit.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <th>Gas Cost:</th>
                                    <td>$${tx.gas_cost.toFixed(6)} (≈ ${gasPrice} Gwei)</td>
                                </tr>
                                <tr>
                                    <th>Net Profit:</th>
                                    <td class="text-${tx.net_profit > 0 ? 'success' : 'danger'}">$${tx.net_profit.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <th>ROI:</th>
                                    <td>${tx.buy_amount > 0 ? ((tx.net_profit / tx.buy_amount) * 100).toFixed(2) : 'N/A'}%</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    ${tx.tx_hash ? `
                    <div class="mt-3">
                        <h6>Blockchain Information</h6>
                        <div class="form-group">
                            <label>Transaction Hash:</label>
                            <div class="input-group">
                                <input type="text" class="form-control" value="${tx.tx_hash}" readonly>
                                <button class="btn btn-primary copy-tx-hash" data-hash="${tx.tx_hash}">Copy</button>
                            </div>
                        </div>
                        <div class="mt-2">
                            <a href="${getExplorerUrl(tx.network, tx.tx_hash)}" target="_blank" class="btn btn-info">
                                View on Explorer <i class="fa fa-external-link"></i>
                            </a>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${tx.error_message ? `
                    <div class="mt-3">
                        <h6>Error Details</h6>
                        <div class="alert alert-danger">
                            ${tx.error_message}
                        </div>
                    </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to the DOM
    document.body.appendChild(modalElement);
    
    // Initialize modal (using Bootstrap)
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // Handle copy button clicks
    const copyButton = modalElement.querySelector('.copy-tx-hash');
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            const hash = copyButton.getAttribute('data-hash');
            navigator.clipboard.writeText(hash)
                .then(() => {
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copyButton.textContent = 'Copy';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                });
        });
    }
    
    // Handle modal close
    modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
    });
}

/**
 * Get blockchain explorer URL for a transaction
 */
function getExplorerUrl(network, txHash) {
    const explorers = {
        'ethereum': 'https://etherscan.io/tx/',
        'polygon': 'https://polygonscan.com/tx/',
        'bsc': 'https://bscscan.com/tx/',
        'arbitrum': 'https://arbiscan.io/tx/',
        'optimism': 'https://optimistic.etherscan.io/tx/'
    };
    
    const baseUrl = explorers[network.toLowerCase()] || explorers.ethereum;
    return baseUrl + txHash;
}

/**
 * Initialize transaction statistics
 */
function initializeTransactionStats(transactions) {
    // Filter transactions by status
    const successful = transactions.filter(tx => tx.status === 'successful');
    const failed = transactions.filter(tx => tx.status === 'failed');
    
    // Calculate total and average profit
    const totalProfit = successful.reduce((sum, tx) => sum + tx.net_profit, 0);
    const averageProfit = successful.length > 0 ? totalProfit / successful.length : 0;
    
    // Calculate success rate
    const successRate = transactions.length > 0 ? (successful.length / transactions.length) * 100 : 0;
    
    // Calculate total gas costs
    const totalGasCost = transactions.reduce((sum, tx) => sum + tx.gas_cost, 0);
    
    // Update stats UI
    updateStatsUI({
        totalTransactions: transactions.length,
        successfulTransactions: successful.length,
        failedTransactions: failed.length,
        totalProfit: totalProfit,
        averageProfit: averageProfit,
        successRate: successRate,
        totalGasCost: totalGasCost
    });
    
    // Initialize charts
    initTransactionCharts(transactions);
}

/**
 * Update statistics UI elements
 */
function updateStatsUI(stats) {
    // Update counters
    document.getElementById('total-tx-count').textContent = stats.totalTransactions;
    document.getElementById('successful-tx-count').textContent = stats.successfulTransactions;
    document.getElementById('failed-tx-count').textContent = stats.failedTransactions;
    
    // Update financial stats
    document.getElementById('total-profit').textContent = `$${stats.totalProfit.toFixed(2)}`;
    document.getElementById('average-profit').textContent = `$${stats.averageProfit.toFixed(2)}`;
    document.getElementById('success-rate').textContent = `${stats.successRate.toFixed(1)}%`;
    document.getElementById('total-gas-cost').textContent = `$${stats.totalGasCost.toFixed(6)}`;
    
    // Update progress bar
    const successRateBar = document.getElementById('success-rate-bar');
    if (successRateBar) {
        successRateBar.style.width = `${stats.successRate}%`;
        
        // Update class based on success rate
        successRateBar.className = 'progress-bar';
        if (stats.successRate >= 80) {
            successRateBar.classList.add('success');
        } else if (stats.successRate >= 50) {
            successRateBar.classList.add('warning');
        } else {
            successRateBar.classList.add('danger');
        }
    }
}

/**
 * Initialize transaction charts
 */
function initTransactionCharts(transactions) {
    // Initialize profit by network chart
    initProfitByNetworkChart(transactions);
    
    // Initialize profit over time chart
    initProfitOverTimeChart(transactions);
}

/**
 * Initialize profit by network chart
 */
function initProfitByNetworkChart(transactions) {
    const ctx = document.getElementById('profit-by-network-chart');
    if (!ctx) return;
    
    // Group profit by network
    const networkProfit = {};
    transactions.forEach(tx => {
        if (tx.status === 'successful') {
            if (!networkProfit[tx.network]) {
                networkProfit[tx.network] = 0;
            }
            networkProfit[tx.network] += tx.net_profit;
        }
    });
    
    // Prepare chart data
    const networks = Object.keys(networkProfit);
    const profits = networks.map(network => networkProfit[network]);
    
    // Network colors
    const networkColors = {
        'ethereum': 'rgba(116, 116, 191, 0.8)',
        'bsc': 'rgba(240, 185, 11, 0.8)',
        'polygon': 'rgba(130, 71, 229, 0.8)',
        'arbitrum': 'rgba(41, 128, 185, 0.8)',
        'optimism': 'rgba(255, 0, 122, 0.8)'
    };
    
    // Get colors for each network
    const backgroundColors = networks.map(network => 
        networkColors[network.toLowerCase()] || 'rgba(108, 99, 255, 0.8)'
    );
    
    // Create chart
    const networkChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: networks,
            datasets: [{
                label: 'Profit by Network (USD)',
                data: profits,
                backgroundColor: backgroundColors
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
                    display: false
                }
            }
        }
    });
}

/**
 * Initialize profit over time chart
 */
function initProfitOverTimeChart(transactions) {
    const ctx = document.getElementById('profit-over-time-chart');
    if (!ctx) return;
    
    // Sort transactions by timestamp
    const sortedTx = [...transactions].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Group profit by day
    const profitByDay = {};
    sortedTx.forEach(tx => {
        if (tx.status === 'successful') {
            const date = new Date(tx.timestamp);
            const day = date.toISOString().split('T')[0];
            
            if (!profitByDay[day]) {
                profitByDay[day] = 0;
            }
            
            profitByDay[day] += tx.net_profit;
        }
    });
    
    // Convert to arrays for chart
    const days = Object.keys(profitByDay).sort();
    const profits = days.map(day => profitByDay[day]);
    
    // Calculate cumulative profit
    const cumulativeProfits = [];
    let runningTotal = 0;
    profits.forEach(profit => {
        runningTotal += profit;
        cumulativeProfits.push(runningTotal);
    });
    
    // Format dates for display
    const formattedDays = days.map(day => {
        const date = new Date(day);
        return date.toLocaleDateString();
    });
    
    // Create chart
    const profitChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: formattedDays,
            datasets: [
                {
                    label: 'Daily Profit (USD)',
                    data: profits,
                    backgroundColor: 'rgba(108, 99, 255, 0.2)',
                    borderColor: 'rgba(108, 99, 255, 1)',
                    borderWidth: 2,
                    type: 'bar'
                },
                {
                    label: 'Cumulative Profit (USD)',
                    data: cumulativeProfits,
                    backgroundColor: 'rgba(0, 200, 83, 0.0)',
                    borderColor: 'rgba(0, 200, 83, 1)',
                    borderWidth: 2,
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    grid: {
                        color: 'rgba(51, 51, 51, 0.3)'
                    },
                    ticks: {
                        color: '#b3b3b3'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        color: 'rgba(0, 200, 83, 1)'
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
}

/**
 * Setup filter event handlers
 */
function setupFilterEvents() {
    const networkFilter = document.getElementById('network-filter');
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');
    
    if (networkFilter) {
        networkFilter.addEventListener('change', applyFilters);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', applyFilters);
    }
    
    // Apply filters button
    const applyFilterBtn = document.getElementById('apply-filter');
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', applyFilters);
    }
    
    // Reset filters button
    const resetFilterBtn = document.getElementById('reset-filter');
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', resetFilters);
    }
}

/**
 * Apply filters to transactions
 */
function applyFilters() {
    // TO BE IMPLEMENTED
    // This would filter the transactions based on the selected filters
    // For now, just reload all transactions
    loadTransactions();
}

/**
 * Reset all filters
 */
function resetFilters() {
    const networkFilter = document.getElementById('network-filter');
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');
    
    if (networkFilter) {
        networkFilter.value = 'all';
    }
    
    if (statusFilter) {
        statusFilter.value = 'all';
    }
    
    if (dateFilter) {
        dateFilter.value = '';
    }
    
    // Reload all transactions
    loadTransactions();
}
