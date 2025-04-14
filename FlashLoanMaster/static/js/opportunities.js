/**
 * Opportunities.js - Handles the arbitrage opportunities page
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize opportunities page
    initOpportunitiesPage();
    
    // Set up recurring data refresh
    setInterval(loadOpportunities, 30000); // Refresh every 30 seconds
});

/**
 * Initialize the opportunities page
 */
function initOpportunitiesPage() {
    console.log('Initializing opportunities page...');
    
    // Load opportunities data
    loadOpportunities();
    
    // Initialize filter events
    setupFilterEvents();
    
    // Initialize scan button
    const scanButton = document.getElementById('scan-now');
    if (scanButton) {
        scanButton.addEventListener('click', triggerManualScan);
    }
}

/**
 * Load opportunities data from the API
 */
function loadOpportunities() {
    // Show loading indicator
    const tableBody = document.querySelector('#opportunities-table tbody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="loader"></div>
                    <p>Loading arbitrage opportunities...</p>
                </td>
            </tr>
        `;
    }
    
    // Fetch opportunities from API
    fetch('/api/opportunities')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                displayOpportunities(data.data);
                initializeOpportunityStats(data.data);
            } else {
                console.error('Error loading opportunities:', data.message);
                if (tableBody) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="7" class="text-center text-danger">
                                Error loading opportunities: ${data.message}
                            </td>
                        </tr>
                    `;
                }
            }
        })
        .catch(error => {
            console.error('Failed to load opportunities:', error);
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-danger">
                            Failed to load opportunities. Please try again later.
                        </td>
                    </tr>
                `;
            }
        });
}

/**
 * Display opportunities in the table
 */
function displayOpportunities(opportunities) {
    const tableBody = document.querySelector('#opportunities-table tbody');
    if (!tableBody) return;
    
    // Clear table body
    tableBody.innerHTML = '';
    
    // Check if there are any opportunities
    if (!opportunities || opportunities.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    No arbitrage opportunities found
                </td>
            </tr>
        `;
        return;
    }
    
    // Loop through opportunities and create table rows
    opportunities.forEach(opp => {
        const row = document.createElement('tr');
        
        // Format the timestamp
        const timestamp = new Date(opp.timestamp);
        const formattedTime = timestamp.toLocaleString();
        
        // Determine status class
        let statusClass = 'info';
        if (opp.status === 'executed') {
            statusClass = 'success';
        } else if (opp.status === 'failed') {
            statusClass = 'danger';
        } else if (opp.status === 'processing') {
            statusClass = 'warning';
        }
        
        row.innerHTML = `
            <td>${opp.id}</td>
            <td>${opp.network}</td>
            <td>${opp.token_pair}</td>
            <td>${opp.buy_dex}</td>
            <td>${opp.sell_dex}</td>
            <td>${opp.price_difference_percent.toFixed(2)}%</td>
            <td>$${opp.expected_profit.toFixed(2)}</td>
            <td>${formattedTime}</td>
            <td><span class="status-pill ${statusClass}">${opp.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary view-opportunity" data-opp-id="${opp.id}">Details</button>
                ${opp.status === 'detected' ? `<button class="btn btn-sm btn-success execute-opportunity" data-opp-id="${opp.id}">Execute</button>` : ''}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.view-opportunity').forEach(button => {
        button.addEventListener('click', () => {
            const oppId = button.getAttribute('data-opp-id');
            showOpportunityDetails(oppId, opportunities);
        });
    });
    
    document.querySelectorAll('.execute-opportunity').forEach(button => {
        button.addEventListener('click', () => {
            const oppId = button.getAttribute('data-opp-id');
            executeOpportunity(oppId);
        });
    });
}

/**
 * Show opportunity details modal
 */
function showOpportunityDetails(oppId, opportunities) {
    // Find the opportunity
    const opp = opportunities.find(o => o.id == oppId);
    if (!opp) return;
    
    // Create modal element
    const modalElement = document.createElement('div');
    modalElement.className = 'modal fade';
    modalElement.id = 'opportunityModal';
    
    // Format the timestamp
    const timestamp = new Date(opp.timestamp);
    const formattedTime = timestamp.toLocaleString();
    
    // Determine status class
    let statusClass = 'info';
    if (opp.status === 'executed') {
        statusClass = 'success';
    } else if (opp.status === 'failed') {
        statusClass = 'danger';
    } else if (opp.status === 'processing') {
        statusClass = 'warning';
    }
    
    modalElement.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Arbitrage Opportunity #${opp.id} Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Opportunity Information</h6>
                            <table class="table">
                                <tr>
                                    <th>Network:</th>
                                    <td>${opp.network}</td>
                                </tr>
                                <tr>
                                    <th>Token Pair:</th>
                                    <td>${opp.token_pair}</td>
                                </tr>
                                <tr>
                                    <th>Buy DEX:</th>
                                    <td>${opp.buy_dex}</td>
                                </tr>
                                <tr>
                                    <th>Sell DEX:</th>
                                    <td>${opp.sell_dex}</td>
                                </tr>
                                <tr>
                                    <th>Detected At:</th>
                                    <td>${formattedTime}</td>
                                </tr>
                                <tr>
                                    <th>Status:</th>
                                    <td><span class="status-pill ${statusClass}">${opp.status}</span></td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6>Financial Details</h6>
                            <table class="table">
                                <tr>
                                    <th>Price Difference:</th>
                                    <td>${opp.price_difference_percent.toFixed(2)}%</td>
                                </tr>
                                <tr>
                                    <th>Expected Profit:</th>
                                    <td>$${opp.expected_profit.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <th>Risk Score:</th>
                                    <td>
                                        <div class="progress" style="height: 10px;">
                                            <div class="progress-bar ${getRiskClass(opp.price_difference_percent)}" 
                                                 style="width: ${getRiskPercentage(opp.price_difference_percent)}%" 
                                                 aria-valuenow="${getRiskPercentage(opp.price_difference_percent)}" 
                                                 aria-valuemin="0" 
                                                 aria-valuemax="100"></div>
                                        </div>
                                        <small>${getRiskRating(opp.price_difference_percent)}</small>
                                    </td>
                                </tr>
                            </table>
                            
                            <h6 class="mt-3">Estimated Transaction Values</h6>
                            <table class="table">
                                <tr>
                                    <th>Flash Loan Size:</th>
                                    <td>$1,000.00</td>
                                </tr>
                                <tr>
                                    <th>Estimated Gas (USD):</th>
                                    <td>$${estimateGasCost(opp.network)}</td>
                                </tr>
                                <tr>
                                    <th>Flash Loan Fee:</th>
                                    <td>$${calculateFlashLoanFee(1000).toFixed(2)} (0.09%)</td>
                                </tr>
                                <tr>
                                    <th>Net Expected Profit:</th>
                                    <td>$${calculateNetProfit(opp.expected_profit, opp.network).toFixed(2)}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <h6>Execution Strategy</h6>
                        <ol>
                            <li>Take a flash loan of $1,000 worth of tokens from ${getFlashLoanProvider(opp.network)}</li>
                            <li>Buy ${opp.token_pair.split('/')[0]} on ${opp.buy_dex} using ${opp.token_pair.split('/')[1]}</li>
                            <li>Sell ${opp.token_pair.split('/')[0]} on ${opp.sell_dex} for ${opp.token_pair.split('/')[1]}</li>
                            <li>Repay flash loan + fee</li>
                            <li>Collect profit</li>
                        </ol>
                    </div>
                </div>
                <div class="modal-footer">
                    ${opp.status === 'detected' ? `
                        <button type="button" class="btn btn-success execute-modal" data-opp-id="${opp.id}">Execute Now</button>
                    ` : ''}
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
    
    // Add event listener to execute button in modal
    const executeButton = modalElement.querySelector('.execute-modal');
    if (executeButton) {
        executeButton.addEventListener('click', () => {
            const oppId = executeButton.getAttribute('data-opp-id');
            executeOpportunity(oppId);
            modal.hide();
        });
    }
    
    // Handle modal close
    modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
    });
}

/**
 * Helper function to get risk class based on price difference
 */
function getRiskClass(priceDiff) {
    if (priceDiff >= 5) {
        return 'success';
    } else if (priceDiff >= 2) {
        return 'warning';
    } else {
        return 'danger';
    }
}

/**
 * Helper function to get risk percentage based on price difference
 */
function getRiskPercentage(priceDiff) {
    // Scale the risk: 1% diff = 30%, 2% diff = 60%, 5%+ diff = 100%
    if (priceDiff >= 5) {
        return 100;
    } else if (priceDiff <= 1) {
        return 30;
    } else {
        return 30 + ((priceDiff - 1) / 4) * 70;
    }
}

/**
 * Helper function to get risk rating based on price difference
 */
function getRiskRating(priceDiff) {
    if (priceDiff >= 5) {
        return 'Low Risk';
    } else if (priceDiff >= 2) {
        return 'Medium Risk';
    } else {
        return 'High Risk';
    }
}

/**
 * Helper function to estimate gas cost based on network
 */
function estimateGasCost(network) {
    const costs = {
        'ethereum': '12.50',
        'polygon': '0.75',
        'bsc': '1.25',
        'arbitrum': '1.50',
        'optimism': '1.80'
    };
    
    return costs[network.toLowerCase()] || '5.00';
}

/**
 * Helper function to calculate flash loan fee
 */
function calculateFlashLoanFee(amount) {
    // Flash loan fee is typically 0.09%
    return amount * 0.0009;
}

/**
 * Helper function to calculate net profit
 */
function calculateNetProfit(expectedProfit, network) {
    const gasCost = parseFloat(estimateGasCost(network));
    const flashLoanFee = calculateFlashLoanFee(1000);
    
    return expectedProfit - gasCost - flashLoanFee;
}

/**
 * Helper function to get flash loan provider based on network
 */
function getFlashLoanProvider(network) {
    const providers = {
        'ethereum': 'Aave',
        'polygon': 'Aave',
        'bsc': 'PancakeSwap',
        'arbitrum': 'dYdX',
        'optimism': 'Uniswap V3'
    };
    
    return providers[network.toLowerCase()] || 'Aave';
}

/**
 * Execute an arbitrage opportunity
 */
function executeOpportunity(oppId) {
    // Show a confirmation dialog
    if (!confirm('Are you sure you want to execute this arbitrage opportunity? This will initiate a flash loan transaction on the blockchain.')) {
        return;
    }
    
    // Show loading notification
    showNotification('Executing arbitrage opportunity...', 'info');
    
    // Here you would call an API endpoint to execute the opportunity
    // For now, we'll just simulate it with a timeout
    setTimeout(() => {
        // Show success notification
        showNotification('Arbitrage execution initiated. Check the transactions page for status.', 'success');
        
        // Reload opportunities after a delay
        setTimeout(loadOpportunities, 2000);
    }, 2000);
}

/**
 * Initialize opportunity statistics
 */
function initializeOpportunityStats(opportunities) {
    // Calculate stats
    const totalOpps = opportunities.length;
    const detectedOpps = opportunities.filter(opp => opp.status === 'detected').length;
    const executedOpps = opportunities.filter(opp => opp.status === 'executed').length;
    const failedOpps = opportunities.filter(opp => opp.status === 'failed').length;
    
    // Calculate total potential profit
    const totalPotentialProfit = opportunities.reduce((sum, opp) => {
        if (opp.status === 'detected' || opp.status === 'processing') {
            return sum + opp.expected_profit;
        }
        return sum;
    }, 0);
    
    // Calculate average price difference
    const avgPriceDiff = opportunities.length > 0 
        ? opportunities.reduce((sum, opp) => sum + opp.price_difference_percent, 0) / opportunities.length 
        : 0;
    
    // Group by network
    const byNetwork = opportunities.reduce((acc, opp) => {
        const network = opp.network.toLowerCase();
        if (!acc[network]) {
            acc[network] = 0;
        }
        acc[network]++;
        return acc;
    }, {});
    
    // Group by token pair
    const byTokenPair = opportunities.reduce((acc, opp) => {
        if (!acc[opp.token_pair]) {
            acc[opp.token_pair] = 0;
        }
        acc[opp.token_pair]++;
        return acc;
    }, {});
    
    // Update stats UI
    updateOpportunityStatsUI({
        totalOpps,
        detectedOpps,
        executedOpps,
        failedOpps,
        totalPotentialProfit,
        avgPriceDiff,
        byNetwork,
        byTokenPair
    });
    
    // Initialize charts
    initOpportunityCharts(opportunities);
}

/**
 * Update opportunity statistics UI
 */
function updateOpportunityStatsUI(stats) {
    // Update counters
    document.getElementById('total-opps').textContent = stats.totalOpps;
    document.getElementById('detected-opps').textContent = stats.detectedOpps;
    document.getElementById('executed-opps').textContent = stats.executedOpps;
    document.getElementById('failed-opps').textContent = stats.failedOpps;
    
    // Update financial stats
    document.getElementById('potential-profit').textContent = `$${stats.totalPotentialProfit.toFixed(2)}`;
    document.getElementById('avg-price-diff').textContent = `${stats.avgPriceDiff.toFixed(2)}%`;
    
    // Update network stats
    const networksList = document.getElementById('networks-list');
    if (networksList) {
        networksList.innerHTML = '';
        
        Object.entries(stats.byNetwork).sort((a, b) => b[1] - a[1]).forEach(([network, count]) => {
            const networkItem = document.createElement('div');
            networkItem.className = 'network-item d-flex justify-content-between align-items-center';
            networkItem.innerHTML = `
                <span>${network.charAt(0).toUpperCase() + network.slice(1)}</span>
                <span class="badge bg-primary">${count}</span>
            `;
            networksList.appendChild(networkItem);
        });
    }
    
    // Update token pair stats
    const pairsList = document.getElementById('pairs-list');
    if (pairsList) {
        pairsList.innerHTML = '';
        
        Object.entries(stats.byTokenPair).sort((a, b) => b[1] - a[1]).forEach(([pair, count]) => {
            const pairItem = document.createElement('div');
            pairItem.className = 'pair-item d-flex justify-content-between align-items-center';
            pairItem.innerHTML = `
                <span>${pair}</span>
                <span class="badge bg-primary">${count}</span>
            `;
            pairsList.appendChild(pairItem);
        });
    }
}

/**
 * Initialize opportunity charts
 */
function initOpportunityCharts(opportunities) {
    // Initialize price difference distribution chart
    initPriceDiffChart(opportunities);
    
    // Initialize opportunity by DEX chart
    initDexChart(opportunities);
}

/**
 * Initialize price difference distribution chart
 */
function initPriceDiffChart(opportunities) {
    const ctx = document.getElementById('price-diff-chart');
    if (!ctx) return;
    
    // Group by price difference ranges
    const ranges = {
        '0-1%': 0,
        '1-2%': 0,
        '2-3%': 0,
        '3-5%': 0,
        '5-10%': 0,
        '10%+': 0
    };
    
    opportunities.forEach(opp => {
        const diff = opp.price_difference_percent;
        
        if (diff < 1) {
            ranges['0-1%']++;
        } else if (diff < 2) {
            ranges['1-2%']++;
        } else if (diff < 3) {
            ranges['2-3%']++;
        } else if (diff < 5) {
            ranges['3-5%']++;
        } else if (diff < 10) {
            ranges['5-10%']++;
        } else {
            ranges['10%+']++;
        }
    });
    
    // Create chart
    const priceDiffChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(ranges),
            datasets: [{
                label: 'Number of Opportunities',
                data: Object.values(ranges),
                backgroundColor: [
                    'rgba(255, 82, 82, 0.7)',
                    'rgba(255, 171, 0, 0.7)',
                    'rgba(255, 214, 0, 0.7)',
                    'rgba(0, 200, 83, 0.7)',
                    'rgba(0, 176, 255, 0.7)',
                    'rgba(108, 99, 255, 0.7)'
                ]
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
                        color: '#b3b3b3',
                        stepSize: 1
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
 * Initialize opportunity by DEX chart
 */
function initDexChart(opportunities) {
    const ctx = document.getElementById('dex-chart');
    if (!ctx) return;
    
    // Count by DEX (buy side)
    const buyDexes = opportunities.reduce((acc, opp) => {
        if (!acc[opp.buy_dex]) {
            acc[opp.buy_dex] = 0;
        }
        acc[opp.buy_dex]++;
        return acc;
    }, {});
    
    // Count by DEX (sell side)
    const sellDexes = opportunities.reduce((acc, opp) => {
        if (!acc[opp.sell_dex]) {
            acc[opp.sell_dex] = 0;
        }
        acc[opp.sell_dex]++;
        return acc;
    }, {});
    
    // Combine all DEXes
    const allDexes = [...new Set([...Object.keys(buyDexes), ...Object.keys(sellDexes)])];
    
    // Prepare data
    const buyData = allDexes.map(dex => buyDexes[dex] || 0);
    const sellData = allDexes.map(dex => sellDexes[dex] || 0);
    
    // Create chart
    const dexChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: allDexes,
            datasets: [
                {
                    label: 'Buy Side',
                    data: buyData,
                    backgroundColor: 'rgba(0, 200, 83, 0.7)'
                },
                {
                    label: 'Sell Side',
                    data: sellData,
                    backgroundColor: 'rgba(255, 82, 82, 0.7)'
                }
            ]
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
                        color: '#b3b3b3',
                        stepSize: 1
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
                }
            }
        }
    });
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
            // Reload opportunities after a delay
            setTimeout(loadOpportunities, 2000);
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
 * Setup filter event handlers
 */
function setupFilterEvents() {
    const networkFilter = document.getElementById('network-filter');
    const statusFilter = document.getElementById('status-filter');
    const minProfitFilter = document.getElementById('min-profit-filter');
    
    if (networkFilter) {
        networkFilter.addEventListener('change', applyFilters);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    if (minProfitFilter) {
        minProfitFilter.addEventListener('input', applyFilters);
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
 * Apply filters to opportunities
 */
function applyFilters() {
    // TO BE IMPLEMENTED
    // This would filter the opportunities based on the selected filters
    // For now, just reload all opportunities
    loadOpportunities();
}

/**
 * Reset all filters
 */
function resetFilters() {
    const networkFilter = document.getElementById('network-filter');
    const statusFilter = document.getElementById('status-filter');
    const minProfitFilter = document.getElementById('min-profit-filter');
    
    if (networkFilter) {
        networkFilter.value = 'all';
    }
    
    if (statusFilter) {
        statusFilter.value = 'all';
    }
    
    if (minProfitFilter) {
        minProfitFilter.value = '0';
    }
    
    // Reload all opportunities
    loadOpportunities();
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
