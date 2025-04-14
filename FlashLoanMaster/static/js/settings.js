/**
 * Settings.js - Handles settings page functionality
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize settings page
    initSettingsPage();
});

/**
 * Initialize the settings page
 */
function initSettingsPage() {
    console.log('Initializing settings page...');
    
    // Load settings data
    loadSettings();
    
    // Setup tab navigation
    setupTabNavigation();
    
    // Setup form submissions
    setupFormSubmissions();
}

/**
 * Load settings data from backend
 */
function loadSettings() {
    // Show loading indicators
    document.querySelectorAll('.settings-section').forEach(section => {
        section.innerHTML = `
            <div class="text-center p-4">
                <div class="loader"></div>
                <p class="mt-2">Loading settings...</p>
            </div>
        `;
    });
    
    // In a real implementation, you would fetch settings from the API
    // For now, we'll just simulate with a timeout to remove loading indicators
    setTimeout(() => {
        document.querySelectorAll('.settings-section').forEach(section => {
            section.innerHTML = ''; // Clear loading indicators
        });
        
        // Load each settings section
        loadNetworkSettings();
        loadDexSettings();
        loadTokenSettings();
        loadFlashLoanSettings();
        loadWalletSettings();
        loadRiskSettings();
    }, 500);
}

/**
 * Setup tab navigation
 */
function setupTabNavigation() {
    const tabLinks = document.querySelectorAll('.nav-link');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs and tab contents
            tabLinks.forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show the corresponding tab content
            const tabId = this.getAttribute('href');
            const tabContent = document.querySelector(tabId);
            if (tabContent) {
                tabContent.classList.add('show', 'active');
            }
        });
    });
}

/**
 * Setup form submission handlers
 */
function setupFormSubmissions() {
    // Network settings form
    const networkForm = document.getElementById('network-settings-form');
    if (networkForm) {
        networkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveNetworkSettings(this);
        });
    }
    
    // DEX settings form
    const dexForm = document.getElementById('dex-settings-form');
    if (dexForm) {
        dexForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveDexSettings(this);
        });
    }
    
    // Token settings form
    const tokenForm = document.getElementById('token-settings-form');
    if (tokenForm) {
        tokenForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveTokenSettings(this);
        });
    }
    
    // Flash loan settings form
    const flashLoanForm = document.getElementById('flash-loan-settings-form');
    if (flashLoanForm) {
        flashLoanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveFlashLoanSettings(this);
        });
    }
    
    // Wallet settings form
    const walletForm = document.getElementById('wallet-settings-form');
    if (walletForm) {
        walletForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveWalletSettings(this);
        });
    }
    
    // Risk settings form
    const riskForm = document.getElementById('risk-settings-form');
    if (riskForm) {
        riskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveRiskSettings(this);
        });
    }
}

/**
 * Load network settings
 */
function loadNetworkSettings() {
    const networkSection = document.querySelector('#networks .settings-section');
    if (!networkSection) return;
    
    // Create network settings form
    networkSection.innerHTML = `
        <form id="network-settings-form">
            <div class="mb-4">
                <button type="button" class="btn btn-primary" id="add-network-btn">
                    <i class="fa fa-plus"></i> Add Network
                </button>
            </div>
            
            <div class="table-responsive">
                <table class="table" id="networks-table">
                    <thead>
                        <tr>
                            <th>Network Name</th>
                            <th>RPC URL</th>
                            <th>Chain ID</th>
                            <th>Explorer URL</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Network rows will be inserted here -->
                        <tr>
                            <td>Ethereum</td>
                            <td>https://mainnet.infura.io/v3/...</td>
                            <td>1</td>
                            <td>https://etherscan.io</td>
                            <td><span class="status-pill success">Active</span></td>
                            <td>
                                <button type="button" class="btn btn-sm btn-primary edit-network" data-network="ethereum">
                                    <i class="fa fa-edit"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-danger delete-network" data-network="ethereum">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>Polygon</td>
                            <td>https://polygon-mainnet.infura.io/v3/...</td>
                            <td>137</td>
                            <td>https://polygonscan.com</td>
                            <td><span class="status-pill success">Active</span></td>
                            <td>
                                <button type="button" class="btn btn-sm btn-primary edit-network" data-network="polygon">
                                    <i class="fa fa-edit"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-danger delete-network" data-network="polygon">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>BSC</td>
                            <td>https://bsc-dataseed.binance.org/</td>
                            <td>56</td>
                            <td>https://bscscan.com</td>
                            <td><span class="status-pill success">Active</span></td>
                            <td>
                                <button type="button" class="btn btn-sm btn-primary edit-network" data-network="bsc">
                                    <i class="fa fa-edit"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-danger delete-network" data-network="bsc">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="mt-3">
                <button type="submit" class="btn btn-success">Save Network Settings</button>
            </div>
        </form>
    `;
    
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-network').forEach(button => {
        button.addEventListener('click', function() {
            const network = this.getAttribute('data-network');
            editNetwork(network);
        });
    });
    
    document.querySelectorAll('.delete-network').forEach(button => {
        button.addEventListener('click', function() {
            const network = this.getAttribute('data-network');
            deleteNetwork(network);
        });
    });
    
    // Add event listener for add network button
    const addNetworkBtn = document.getElementById('add-network-btn');
    if (addNetworkBtn) {
        addNetworkBtn.addEventListener('click', addNetwork);
    }
}

/**
 * Add a new network
 */
function addNetwork() {
    // Create modal for adding a new network
    const modalElement = document.createElement('div');
    modalElement.className = 'modal fade';
    modalElement.id = 'addNetworkModal';
    
    modalElement.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add New Network</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="add-network-form">
                        <div class="form-group mb-3">
                            <label for="network-name" class="form-label">Network Name</label>
                            <input type="text" class="form-control" id="network-name" name="network_name" required>
                        </div>
                        <div class="form-group mb-3">
                            <label for="rpc-url" class="form-label">RPC URL</label>
                            <input type="text" class="form-control" id="rpc-url" name="rpc_url" required>
                        </div>
                        <div class="form-group mb-3">
                            <label for="chain-id" class="form-label">Chain ID</label>
                            <input type="number" class="form-control" id="chain-id" name="chain_id" required>
                        </div>
                        <div class="form-group mb-3">
                            <label for="explorer-url" class="form-label">Explorer URL</label>
                            <input type="text" class="form-control" id="explorer-url" name="explorer_url" required>
                        </div>
                        <div class="form-check mb-3">
                            <input type="checkbox" class="form-check-input" id="active" name="active" checked>
                            <label class="form-check-label" for="active">Active</label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="save-network-btn">Add Network</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to the DOM
    document.body.appendChild(modalElement);
    
    // Initialize modal (using Bootstrap)
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // Handle save button click
    const saveBtn = document.getElementById('save-network-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const form = document.getElementById('add-network-form');
            if (form.checkValidity()) {
                // Get form data
                const networkName = document.getElementById('network-name').value;
                const rpcUrl = document.getElementById('rpc-url').value;
                const chainId = document.getElementById('chain-id').value;
                const explorerUrl = document.getElementById('explorer-url').value;
                const active = document.getElementById('active').checked;
                
                // In a real implementation, you would submit this data to the server
                console.log('Adding network:', {
                    network_name: networkName,
                    rpc_url: rpcUrl,
                    chain_id: chainId,
                    explorer_url: explorerUrl,
                    active: active
                });
                
                // Show success notification
                showNotification(`Network ${networkName} added successfully`, 'success');
                
                // Close modal
                modal.hide();
                
                // Reload network settings
                loadNetworkSettings();
            } else {
                form.reportValidity();
            }
        });
    }
    
    // Handle modal close
    modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
    });
}

/**
 * Edit a network
 */
function editNetwork(network) {
    console.log('Editing network:', network);
    
    // In a real implementation, you would fetch the network details from the server
    // and open a modal with the details for editing
    showNotification(`Editing network ${network} - Not implemented in this demo`, 'info');
}

/**
 * Delete a network
 */
function deleteNetwork(network) {
    if (confirm(`Are you sure you want to delete the network "${network}"?`)) {
        console.log('Deleting network:', network);
        
        // In a real implementation, you would send a delete request to the server
        showNotification(`Network ${network} deleted successfully`, 'success');
        
        // Reload network settings
        loadNetworkSettings();
    }
}

/**
 * Save network settings
 */
function saveNetworkSettings(form) {
    console.log('Saving network settings');
    
    // In a real implementation, you would submit the form data to the server
    
    // Show success notification
    showNotification('Network settings saved successfully', 'success');
}

/**
 * Load DEX settings
 */
function loadDexSettings() {
    const dexSection = document.querySelector('#dexes .settings-section');
    if (!dexSection) return;
    
    // Create DEX settings form
    dexSection.innerHTML = `
        <form id="dex-settings-form">
            <div class="mb-4">
                <div class="row">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="dex-network-filter" class="form-label">Filter by Network</label>
                            <select class="form-control" id="dex-network-filter">
                                <option value="all">All Networks</option>
                                <option value="ethereum">Ethereum</option>
                                <option value="polygon">Polygon</option>
                                <option value="bsc">BSC</option>
                                <option value="arbitrum">Arbitrum</option>
                                <option value="optimism">Optimism</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-8 text-end d-flex align-items-end">
                        <button type="button" class="btn btn-primary ms-auto" id="add-dex-btn">
                            <i class="fa fa-plus"></i> Add DEX
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table" id="dexes-table">
                    <thead>
                        <tr>
                            <th>DEX Name</th>
                            <th>Network</th>
                            <th>Router Address</th>
                            <th>Factory Address</th>
                            <th>Version</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- DEX rows will be inserted here -->
                        <tr>
                            <td>Uniswap V2</td>
                            <td>Ethereum</td>
                            <td>0x7a250d5630B4...</td>
                            <td>0x5C69bEe701ef...</td>
                            <td>v2</td>
                            <td><span class="status-pill success">Active</span></td>
                            <td>
                                <button type="button" class="btn btn-sm btn-primary edit-dex" data-dex="uniswap_v2">
                                    <i class="fa fa-edit"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-danger delete-dex" data-dex="uniswap_v2">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>PancakeSwap</td>
                            <td>BSC</td>
                            <td>0x10ED43C718714...</td>
                            <td>0xcA143Ce32Fe78...</td>
                            <td>v2</td>
                            <td><span class="status-pill success">Active</span></td>
                            <td>
                                <button type="button" class="btn btn-sm btn-primary edit-dex" data-dex="pancakeswap">
                                    <i class="fa fa-edit"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-danger delete-dex" data-dex="pancakeswap">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="mt-3">
                <button type="submit" class="btn btn-success">Save DEX Settings</button>
            </div>
        </form>
    `;
    
    // Add event listeners
    const dexNetworkFilter = document.getElementById('dex-network-filter');
    if (dexNetworkFilter) {
        dexNetworkFilter.addEventListener('change', filterDexes);
    }
    
    const addDexBtn = document.getElementById('add-dex-btn');
    if (addDexBtn) {
        addDexBtn.addEventListener('click', addDex);
    }
    
    document.querySelectorAll('.edit-dex').forEach(button => {
        button.addEventListener('click', function() {
            const dex = this.getAttribute('data-dex');
            editDex(dex);
        });
    });
    
    document.querySelectorAll('.delete-dex').forEach(button => {
        button.addEventListener('click', function() {
            const dex = this.getAttribute('data-dex');
            deleteDex(dex);
        });
    });
}

/**
 * Filter DEXes by network
 */
function filterDexes() {
    const network = document.getElementById('dex-network-filter').value;
    console.log('Filtering DEXes by network:', network);
    
    // In a real implementation, you would filter the table rows based on the selected network
    
    // For this demo, we'll just reload the DEX settings
    loadDexSettings();
}

/**
 * Add a new DEX
 */
function addDex() {
    // Similar to addNetwork, but for DEXes
    showNotification('Add DEX - Not implemented in this demo', 'info');
}

/**
 * Edit a DEX
 */
function editDex(dex) {
    console.log('Editing DEX:', dex);
    showNotification(`Editing DEX ${dex} - Not implemented in this demo`, 'info');
}

/**
 * Delete a DEX
 */
function deleteDex(dex) {
    if (confirm(`Are you sure you want to delete the DEX "${dex}"?`)) {
        console.log('Deleting DEX:', dex);
        showNotification(`DEX ${dex} deleted successfully`, 'success');
        loadDexSettings();
    }
}

/**
 * Save DEX settings
 */
function saveDexSettings(form) {
    console.log('Saving DEX settings');
    showNotification('DEX settings saved successfully', 'success');
}

/**
 * Load token settings
 */
function loadTokenSettings() {
    const tokenSection = document.querySelector('#tokens .settings-section');
    if (!tokenSection) return;
    
    // Create token settings form (similar to DEX settings)
    tokenSection.innerHTML = `
        <form id="token-settings-form">
            <div class="mb-4">
                <div class="row">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="token-network-filter" class="form-label">Filter by Network</label>
                            <select class="form-control" id="token-network-filter">
                                <option value="all">All Networks</option>
                                <option value="ethereum">Ethereum</option>
                                <option value="polygon">Polygon</option>
                                <option value="bsc">BSC</option>
                                <option value="arbitrum">Arbitrum</option>
                                <option value="optimism">Optimism</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-8 text-end d-flex align-items-end">
                        <button type="button" class="btn btn-primary ms-auto" id="add-token-btn">
                            <i class="fa fa-plus"></i> Add Token
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table" id="tokens-table">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Network</th>
                            <th>Address</th>
                            <th>Decimals</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Token rows will be inserted here -->
                        <tr>
                            <td>WETH</td>
                            <td>Ethereum</td>
                            <td>0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2</td>
                            <td>18</td>
                            <td><span class="status-pill success">Active</span></td>
                            <td>
                                <button type="button" class="btn btn-sm btn-primary edit-token" data-token="WETH">
                                    <i class="fa fa-edit"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-danger delete-token" data-token="WETH">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>USDC</td>
                            <td>Ethereum</td>
                            <td>0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48</td>
                            <td>6</td>
                            <td><span class="status-pill success">Active</span></td>
                            <td>
                                <button type="button" class="btn btn-sm btn-primary edit-token" data-token="USDC">
                                    <i class="fa fa-edit"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-danger delete-token" data-token="USDC">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="mt-3">
                <button type="submit" class="btn btn-success">Save Token Settings</button>
            </div>
        </form>
    `;
    
    // Add event listeners
    const tokenNetworkFilter = document.getElementById('token-network-filter');
    if (tokenNetworkFilter) {
        tokenNetworkFilter.addEventListener('change', filterTokens);
    }
    
    const addTokenBtn = document.getElementById('add-token-btn');
    if (addTokenBtn) {
        addTokenBtn.addEventListener('click', addToken);
    }
    
    document.querySelectorAll('.edit-token').forEach(button => {
        button.addEventListener('click', function() {
            const token = this.getAttribute('data-token');
            editToken(token);
        });
    });
    
    document.querySelectorAll('.delete-token').forEach(button => {
        button.addEventListener('click', function() {
            const token = this.getAttribute('data-token');
            deleteToken(token);
        });
    });
}

/**
 * Filter tokens by network
 */
function filterTokens() {
    const network = document.getElementById('token-network-filter').value;
    console.log('Filtering tokens by network:', network);
    
    // In a real implementation, you would filter the table rows based on the selected network
    
    // For this demo, we'll just reload the token settings
    loadTokenSettings();
}

/**
 * Add a new token
 */
function addToken() {
    showNotification('Add Token - Not implemented in this demo', 'info');
}

/**
 * Edit a token
 */
function editToken(token) {
    console.log('Editing token:', token);
    showNotification(`Editing token ${token} - Not implemented in this demo`, 'info');
}

/**
 * Delete a token
 */
function deleteToken(token) {
    if (confirm(`Are you sure you want to delete the token "${token}"?`)) {
        console.log('Deleting token:', token);
        showNotification(`Token ${token} deleted successfully`, 'success');
        loadTokenSettings();
    }
}

/**
 * Save token settings
 */
function saveTokenSettings(form) {
    console.log('Saving token settings');
    showNotification('Token settings saved successfully', 'success');
}

/**
 * Load flash loan settings
 */
function loadFlashLoanSettings() {
    const flashLoanSection = document.querySelector('#flash-loans .settings-section');
    if (!flashLoanSection) return;
    
    // Create flash loan settings form
    flashLoanSection.innerHTML = `
        <form id="flash-loan-settings-form">
            <div class="mb-4">
                <div class="row">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="flash-loan-network-filter" class="form-label">Filter by Network</label>
                            <select class="form-control" id="flash-loan-network-filter">
                                <option value="all">All Networks</option>
                                <option value="ethereum">Ethereum</option>
                                <option value="polygon">Polygon</option>
                                <option value="bsc">BSC</option>
                                <option value="arbitrum">Arbitrum</option>
                                <option value="optimism">Optimism</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-8 text-end d-flex align-items-end">
                        <button type="button" class="btn btn-primary ms-auto" id="add-flash-loan-btn">
                            <i class="fa fa-plus"></i> Add Flash Loan Protocol
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table" id="flash-loans-table">
                    <thead>
                        <tr>
                            <th>Protocol</th>
                            <th>Network</th>
                            <th>Contract Address</th>
                            <th>Fee</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Flash loan protocol rows will be inserted here -->
                        <tr>
                            <td>Aave</td>
                            <td>Ethereum</td>
                            <td>0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9</td>
                            <td>0.09%</td>
                            <td><span class="status-pill success">Active</span></td>
                            <td>
                                <button type="button" class="btn btn-sm btn-primary edit-flash-loan" data-protocol="aave">
                                    <i class="fa fa-edit"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-danger delete-flash-loan" data-protocol="aave">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>dYdX</td>
                            <td>Ethereum</td>
                            <td>0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e</td>
                            <td>0.00%</td>
                            <td><span class="status-pill success">Active</span></td>
                            <td>
                                <button type="button" class="btn btn-sm btn-primary edit-flash-loan" data-protocol="dydx">
                                    <i class="fa fa-edit"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-danger delete-flash-loan" data-protocol="dydx">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="mt-3">
                <button type="submit" class="btn btn-success">Save Flash Loan Settings</button>
            </div>
        </form>
    `;
    
    // Add event listeners
    const flashLoanNetworkFilter = document.getElementById('flash-loan-network-filter');
    if (flashLoanNetworkFilter) {
        flashLoanNetworkFilter.addEventListener('change', filterFlashLoanProtocols);
    }
    
    const addFlashLoanBtn = document.getElementById('add-flash-loan-btn');
    if (addFlashLoanBtn) {
        addFlashLoanBtn.addEventListener('click', addFlashLoanProtocol);
    }
    
    document.querySelectorAll('.edit-flash-loan').forEach(button => {
        button.addEventListener('click', function() {
            const protocol = this.getAttribute('data-protocol');
            editFlashLoanProtocol(protocol);
        });
    });
    
    document.querySelectorAll('.delete-flash-loan').forEach(button => {
        button.addEventListener('click', function() {
            const protocol = this.getAttribute('data-protocol');
            deleteFlashLoanProtocol(protocol);
        });
    });
}

/**
 * Filter flash loan protocols by network
 */
function filterFlashLoanProtocols() {
    const network = document.getElementById('flash-loan-network-filter').value;
    console.log('Filtering flash loan protocols by network:', network);
    
    // In a real implementation, you would filter the table rows based on the selected network
    
    // For this demo, we'll just reload the flash loan settings
    loadFlashLoanSettings();
}

/**
 * Add a new flash loan protocol
 */
function addFlashLoanProtocol() {
    showNotification('Add Flash Loan Protocol - Not implemented in this demo', 'info');
}

/**
 * Edit a flash loan protocol
 */
function editFlashLoanProtocol(protocol) {
    console.log('Editing flash loan protocol:', protocol);
    showNotification(`Editing flash loan protocol ${protocol} - Not implemented in this demo`, 'info');
}

/**
 * Delete a flash loan protocol
 */
function deleteFlashLoanProtocol(protocol) {
    if (confirm(`Are you sure you want to delete the flash loan protocol "${protocol}"?`)) {
        console.log('Deleting flash loan protocol:', protocol);
        showNotification(`Flash loan protocol ${protocol} deleted successfully`, 'success');
        loadFlashLoanSettings();
    }
}

/**
 * Save flash loan settings
 */
function saveFlashLoanSettings(form) {
    console.log('Saving flash loan settings');
    showNotification('Flash loan settings saved successfully', 'success');
}

/**
 * Load wallet settings
 */
function loadWalletSettings() {
    const walletSection = document.querySelector('#wallets .settings-section');
    if (!walletSection) return;
    
    // Create wallet settings form
    walletSection.innerHTML = `
        <form id="wallet-settings-form">
            <div class="mb-4">
                <div class="row">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="wallet-network-filter" class="form-label">Filter by Network</label>
                            <select class="form-control" id="wallet-network-filter">
                                <option value="all">All Networks</option>
                                <option value="ethereum">Ethereum</option>
                                <option value="polygon">Polygon</option>
                                <option value="bsc">BSC</option>
                                <option value="arbitrum">Arbitrum</option>
                                <option value="optimism">Optimism</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-8 text-end d-flex align-items-end">
                        <button type="button" class="btn btn-primary ms-auto" id="add-wallet-btn">
                            <i class="fa fa-plus"></i> Add Wallet
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table" id="wallets-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Network</th>
                            <th>Address</th>
                            <th>Percentage Share</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Wallet rows will be inserted here -->
                        <tr>
                            <td>Main Wallet</td>
                            <td>Ethereum</td>
                            <td>0x7B5c3c77892173C14d9415Da11931052Fc034f79</td>
                            <td>100%</td>
                            <td><span class="status-pill success">Active</span></td>
                            <td>
                                <button type="button" class="btn btn-sm btn-primary edit-wallet" data-wallet="main-wallet">
                                    <i class="fa fa-edit"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-danger delete-wallet" data-wallet="main-wallet">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>BSC Wallet</td>
                            <td>BSC</td>
                            <td>0x57E0b47bA8308F1A40f95bB4D3aA867cd1C08760</td>
                            <td>100%</td>
                            <td><span class="status-pill success">Active</span></td>
                            <td>
                                <button type="button" class="btn btn-sm btn-primary edit-wallet" data-wallet="bsc-wallet">
                                    <i class="fa fa-edit"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-danger delete-wallet" data-wallet="bsc-wallet">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="mt-3">
                <button type="submit" class="btn btn-success">Save Wallet Settings</button>
            </div>
        </form>
    `;
    
    // Add event listeners
    const walletNetworkFilter = document.getElementById('wallet-network-filter');
    if (walletNetworkFilter) {
        walletNetworkFilter.addEventListener('change', filterWallets);
    }
    
    const addWalletBtn = document.getElementById('add-wallet-btn');
    if (addWalletBtn) {
        addWalletBtn.addEventListener('click', addWallet);
    }
    
    document.querySelectorAll('.edit-wallet').forEach(button => {
        button.addEventListener('click', function() {
            const wallet = this.getAttribute('data-wallet');
            editWallet(wallet);
        });
    });
    
    document.querySelectorAll('.delete-wallet').forEach(button => {
        button.addEventListener('click', function() {
            const wallet = this.getAttribute('data-wallet');
            deleteWallet(wallet);
        });
    });
}

/**
 * Filter wallets by network
 */
function filterWallets() {
    const network = document.getElementById('wallet-network-filter').value;
    console.log('Filtering wallets by network:', network);
    
    // In a real implementation, you would filter the table rows based on the selected network
    
    // For this demo, we'll just reload the wallet settings
    loadWalletSettings();
}

/**
 * Add a new wallet
 */
function addWallet() {
    showNotification('Add Wallet - Not implemented in this demo', 'info');
}

/**
 * Edit a wallet
 */
function editWallet(wallet) {
    console.log('Editing wallet:', wallet);
    showNotification(`Editing wallet ${wallet} - Not implemented in this demo`, 'info');
}

/**
 * Delete a wallet
 */
function deleteWallet(wallet) {
    if (confirm(`Are you sure you want to delete the wallet "${wallet}"?`)) {
        console.log('Deleting wallet:', wallet);
        showNotification(`Wallet ${wallet} deleted successfully`, 'success');
        loadWalletSettings();
    }
}

/**
 * Save wallet settings
 */
function saveWalletSettings(form) {
    console.log('Saving wallet settings');
    showNotification('Wallet settings saved successfully', 'success');
}

/**
 * Load risk settings
 */
function loadRiskSettings() {
    const riskSection = document.querySelector('#risk .settings-section');
    if (!riskSection) return;
    
    // Create risk settings form
    riskSection.innerHTML = `
        <form id="risk-settings-form">
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">Risk Management Settings</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="min-profit-threshold" class="form-label">Minimum Profit Threshold (%)</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" id="min-profit-threshold" name="min_profit_threshold" value="0.5" min="0" step="0.1">
                                    <span class="input-group-text">%</span>
                                </div>
                                <small class="form-text text-muted">Minimum profit percentage required to execute a trade</small>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="max-slippage" class="form-label">Maximum Slippage (%)</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" id="max-slippage" name="max_slippage" value="3.0" min="0" step="0.1">
                                    <span class="input-group-text">%</span>
                                </div>
                                <small class="form-text text-muted">Maximum allowed slippage percentage for trades</small>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="max-gas-cost" class="form-label">Maximum Gas Cost (USD)</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="number" class="form-control" id="max-gas-cost" name="max_gas_cost" value="100.0" min="0" step="1">
                                </div>
                                <small class="form-text text-muted">Maximum gas cost allowed for a transaction</small>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="max-exposure" class="form-label">Maximum Exposure (USD)</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="number" class="form-control" id="max-exposure" name="max_exposure" value="1000.0" min="0" step="100">
                                </div>
                                <small class="form-text text-muted">Maximum total exposure across all positions</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">Risk Calculation Weights</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="price-diff-weight" class="form-label">Price Difference Weight</label>
                                <input type="range" class="form-range" id="price-diff-weight" name="price_diff_weight" min="0" max="1" step="0.1" value="0.3">
                                <div class="d-flex justify-content-between">
                                    <small>0.0</small>
                                    <small>0.5</small>
                                    <small>1.0</small>
                                </div>
                                <small class="form-text text-muted">Weight of price difference in risk calculation</small>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="profit-weight" class="form-label">Expected Profit Weight</label>
                                <input type="range" class="form-range" id="profit-weight" name="profit_weight" min="0" max="1" step="0.1" value="0.4">
                                <div class="d-flex justify-content-between">
                                    <small>0.0</small>
                                    <small>0.5</small>
                                    <small>1.0</small>
                                </div>
                                <small class="form-text text-muted">Weight of expected profit in risk calculation</small>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="slippage-weight" class="form-label">Slippage Weight</label>
                                <input type="range" class="form-range" id="slippage-weight" name="slippage_weight" min="0" max="1" step="0.1" value="0.2">
                                <div class="d-flex justify-content-between">
                                    <small>0.0</small>
                                    <small>0.5</small>
                                    <small>1.0</small>
                                </div>
                                <small class="form-text text-muted">Weight of slippage in risk calculation</small>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="gas-weight" class="form-label">Gas Cost Weight</label>
                                <input type="range" class="form-range" id="gas-weight" name="gas_weight" min="0" max="1" step="0.1" value="0.1">
                                <div class="d-flex justify-content-between">
                                    <small>0.0</small>
                                    <small>0.5</small>
                                    <small>1.0</small>
                                </div>
                                <small class="form-text text-muted">Weight of gas cost in risk calculation</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">Risk Threshold</h5>
                </div>
                <div class="card-body">
                    <div class="form-group">
                        <label for="risk-threshold" class="form-label">Minimum Risk Score</label>
                        <input type="range" class="form-range" id="risk-threshold" name="risk_threshold" min="0" max="1" step="0.05" value="0.7">
                        <div class="d-flex justify-content-between">
                            <small>High Risk (0.0)</small>
                            <small>Medium Risk (0.5)</small>
                            <small>Low Risk (1.0)</small>
                        </div>
                        <small class="form-text text-muted">Minimum risk score required to execute a trade</small>
                    </div>
                </div>
            </div>
            
            <div class="mt-3">
                <button type="submit" class="btn btn-success">Save Risk Settings</button>
            </div>
        </form>
    `;
    
    // No additional event listeners needed here
}

/**
 * Save risk settings
 */
function saveRiskSettings(form) {
    console.log('Saving risk settings');
    
    // Get form values
    const minProfitThreshold = parseFloat(document.getElementById('min-profit-threshold').value);
    const maxSlippage = parseFloat(document.getElementById('max-slippage').value);
    const maxGasCost = parseFloat(document.getElementById('max-gas-cost').value);
    const maxExposure = parseFloat(document.getElementById('max-exposure').value);
    const priceDiffWeight = parseFloat(document.getElementById('price-diff-weight').value);
    const profitWeight = parseFloat(document.getElementById('profit-weight').value);
    const slippageWeight = parseFloat(document.getElementById('slippage-weight').value);
    const gasWeight = parseFloat(document.getElementById('gas-weight').value);
    const riskThreshold = parseFloat(document.getElementById('risk-threshold').value);
    
    // Validate that weights sum to 1
    const weightSum = priceDiffWeight + profitWeight + slippageWeight + gasWeight;
    if (Math.abs(weightSum - 1.0) > 0.01) {
        showNotification(`Weights must sum to 1.0. Current sum: ${weightSum.toFixed(2)}`, 'warning');
        return;
    }
    
    // In a real implementation, you would submit the form data to the server
    
    // Show success notification
    showNotification('Risk settings saved successfully', 'success');
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
