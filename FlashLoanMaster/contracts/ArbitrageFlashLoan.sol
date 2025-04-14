// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ArbitrageFlashLoan
 * @dev Contrato para executar flash loans e arbitragem entre múltiplas DEXs
 * 
 * Este contrato permite:
 * 1. Tomar flash loans de protocolos como Aave, dYdX e Uniswap V3
 * 2. Executar arbitragem entre diferentes DEXs (Uniswap, Sushiswap, etc.)
 * 3. Devolver o flash loan com taxa e capturar o lucro
 * 4. Distribuir lucros conforme configuração
 */

// Interfaces
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
}

// Interface para o Protocolo Aave V2
interface ILendingPool {
    function flashLoan(
        address receiverAddress,
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata modes,
        address onBehalfOf,
        bytes calldata params,
        uint16 referralCode
    ) external;
}

// Interface para o Flash Loan Receiver do Aave
interface IFlashLoanReceiver {
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external returns (bool);
}

// Contrato principal
contract ArbitrageFlashLoan is IFlashLoanReceiver {
    // Variáveis de estado
    address public owner;
    bool public isExecutionLocked;
    uint256 public minProfitThreshold;
    uint256 public aaveFeePercentage;
    
    // Mapeamento para armazenar diferentes routers de DEXs
    mapping(string => address) public dexRouters;
    
    // Eventos
    event ArbitrageExecuted(
        address indexed token,
        uint256 amountBorrowed,
        uint256 profit,
        string buyDex,
        string sellDex
    );
    
    event ProfitDistributed(
        address indexed recipientAddress,
        string recipientName,
        uint256 amount
    );
    
    event EmergencyWithdraw(
        address indexed token,
        uint256 amount,
        address indexed to
    );
    
    // Modificadores
    modifier onlyOwner() {
        require(msg.sender == owner, "ArbitrageFlashLoan: caller is not the owner");
        _;
    }
    
    modifier noReentrancy() {
        require(!isExecutionLocked, "ArbitrageFlashLoan: reentrant call");
        isExecutionLocked = true;
        _;
        isExecutionLocked = false;
    }
    
    // Construtor
    constructor() {
        owner = msg.sender;
        isExecutionLocked = false;
        minProfitThreshold = 0; // Será definido depois
        aaveFeePercentage = 9; // 0.09% para Aave V2
        
        // Configurar DEXs (endereços da mainnet Ethereum)
        dexRouters["uniswap"] = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
        dexRouters["sushiswap"] = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;
        dexRouters["curve"] = 0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7;
    }
    
    // Funções de Administração
    
    /**
     * @dev Adiciona ou atualiza um roteador de DEX
     * @param dexName Nome do DEX
     * @param routerAddress Endereço do roteador
     */
    function setDexRouter(string memory dexName, address routerAddress) external onlyOwner {
        require(routerAddress != address(0), "ArbitrageFlashLoan: invalid router address");
        dexRouters[dexName] = routerAddress;
    }
    
    /**
     * @dev Define o limiar mínimo de lucro
     * @param threshold Novo limiar em unidades (ex: 10 = 0.01%)
     */
    function setMinProfitThreshold(uint256 threshold) external onlyOwner {
        minProfitThreshold = threshold;
    }
    
    /**
     * @dev Atualiza o percentual de taxa do Aave
     * @param percentage Nova taxa em unidades (ex: 9 = 0.09%)
     */
    function setAaveFeePercentage(uint256 percentage) external onlyOwner {
        aaveFeePercentage = percentage;
    }
    
    /**
     * @dev Transfere a propriedade do contrato
     * @param newOwner Endereço do novo proprietário
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ArbitrageFlashLoan: new owner is the zero address");
        owner = newOwner;
    }
    
    /**
     * @dev Retira fundos em caso de emergência
     * @param token Endereço do token a ser retirado (use address(0) para ETH)
     * @param to Endereço para receber os fundos
     */
    function emergencyWithdraw(address token, address to) external onlyOwner {
        require(to != address(0), "ArbitrageFlashLoan: invalid recipient address");
        
        if (token == address(0)) {
            // Retirar ETH
            uint256 balance = address(this).balance;
            require(balance > 0, "ArbitrageFlashLoan: no ETH to withdraw");
            
            (bool success, ) = to.call{value: balance}("");
            require(success, "ArbitrageFlashLoan: ETH transfer failed");
            
            emit EmergencyWithdraw(address(0), balance, to);
        } else {
            // Retirar tokens ERC20
            uint256 balance = IERC20(token).balanceOf(address(this));
            require(balance > 0, "ArbitrageFlashLoan: no tokens to withdraw");
            
            IERC20(token).transfer(to, balance);
            
            emit EmergencyWithdraw(token, balance, to);
        }
    }
    
    // Funções de Flash Loan e Arbitragem
    
    /**
     * @dev Inicia um flash loan através do Aave para arbitragem
     * @param assets Endereços dos tokens a serem emprestados
     * @param amounts Quantidades a serem emprestadas
     * @param buyDex DEX para comprar
     * @param sellDex DEX para vender
     */
    function executeAaveFlashLoan(
        address[] calldata assets,
        uint256[] calldata amounts,
        string calldata buyDex,
        string calldata sellDex
    ) external onlyOwner noReentrancy {
        require(assets.length == amounts.length, "ArbitrageFlashLoan: array length mismatch");
        require(assets.length > 0, "ArbitrageFlashLoan: empty arrays");
        
        // Verificar se os DEXs existem
        require(dexRouters[buyDex] != address(0), "ArbitrageFlashLoan: buy DEX not configured");
        require(dexRouters[sellDex] != address(0), "ArbitrageFlashLoan: sell DEX not configured");
        
        // Codificar parâmetros adicionais para o callback
        bytes memory params = abi.encode(buyDex, sellDex);
        
        // Modos: 0 = sem débito (flash loan padrão), 1 = débito estável, 2 = débito variável
        uint256[] memory modes = new uint256[](assets.length);
        for (uint256 i = 0; i < assets.length; i++) {
            modes[i] = 0; // Modo flash loan padrão
        }
        
        // Endereço do LendingPool da Aave V2 na Mainnet Ethereum
        address aaveLendingPool = 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9;
        
        // Chamar flash loan
        ILendingPool(aaveLendingPool).flashLoan(
            address(this),
            assets,
            amounts,
            modes,
            address(this),
            params,
            0 // referral code (não utilizado)
        );
    }
    
    /**
     * @dev Callback executado pelo Aave após receber o flash loan
     * @param assets Endereços dos tokens emprestados
     * @param amounts Quantidades emprestadas
     * @param premiums Taxas a serem pagas
     * @param initiator Endereço que iniciou o flash loan
     * @param params Parâmetros adicionais
     * @return Sucesso da operação
     */
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override noReentrancy returns (bool) {
        // Verificar chamador
        address aaveLendingPool = 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9;
        require(msg.sender == aaveLendingPool, "ArbitrageFlashLoan: caller is not Aave lending pool");
        require(initiator == address(this), "ArbitrageFlashLoan: initiator is not this contract");
        
        // Decodificar parâmetros
        (string memory buyDex, string memory sellDex) = abi.decode(params, (string, string));
        
        // Para cada token emprestado
        for (uint256 i = 0; i < assets.length; i++) {
            address token = assets[i];
            uint256 amount = amounts[i];
            uint256 fee = premiums[i];
            uint256 amountToRepay = amount + fee;
            
            // Executar arbitragem
            uint256 balanceBefore = IERC20(token).balanceOf(address(this));
            
            // 1. Realizar swap no primeiro DEX
            executeArbitrage(token, amount, buyDex, sellDex);
            
            // 2. Verificar resultado após arbitragem
            uint256 balanceAfter = IERC20(token).balanceOf(address(this));
            
            // Verificar se temos lucro suficiente
            require(balanceAfter >= amountToRepay, "ArbitrageFlashLoan: insufficient funds to repay");
            
            // Calcular lucro
            uint256 profit = balanceAfter - balanceBefore - fee;
            
            // Verificar se o lucro atende ao limiar mínimo
            require(profit >= minProfitThreshold, "ArbitrageFlashLoan: profit below threshold");
            
            // Aprovar repagamento para o Aave
            IERC20(token).approve(aaveLendingPool, amountToRepay);
            
            // Emitir evento
            emit ArbitrageExecuted(token, amount, profit, buyDex, sellDex);
        }
        
        return true;
    }
    
    /**
     * @dev Executa a arbitragem entre dois DEXs
     * @param token Endereço do token para arbitragem
     * @param amount Quantidade a ser usada
     * @param buyDex DEX para comprar
     * @param sellDex DEX para vender
     */
    function executeArbitrage(
        address token,
        uint256 amount,
        string memory buyDex,
        string memory sellDex
    ) internal {
        // Implementação simplificada para demonstração
        // Em um cenário real, essa função executaria swaps entre diferentes pares e DEXs
        
        // Tokens para o caminho (exemplo: token -> WETH -> USDC -> token)
        address WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
        address USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
        
        // Aprovar roteador de compra para gastar nossos tokens
        IERC20(token).approve(dexRouters[buyDex], amount);
        
        // Construir caminho para compra
        address[] memory buyPath = new address[](3);
        buyPath[0] = token;
        buyPath[1] = WETH;
        buyPath[2] = USDC;
        
        // Executar swap no DEX de compra
        uint256 deadline = block.timestamp + 300; // 5 minutos
        uint256[] memory amounts = IUniswapV2Router(dexRouters[buyDex]).swapExactTokensForTokens(
            amount,
            0, // Sem garantia de mínimo para simplificar
            buyPath,
            address(this),
            deadline
        );
        
        // Quantidade de USDC recebida
        uint256 usdcAmount = amounts[amounts.length - 1];
        
        // Aprovar roteador de venda para gastar nossos USDC
        IERC20(USDC).approve(dexRouters[sellDex], usdcAmount);
        
        // Construir caminho para venda
        address[] memory sellPath = new address[](3);
        sellPath[0] = USDC;
        sellPath[1] = WETH;
        sellPath[2] = token;
        
        // Executar swap no DEX de venda
        IUniswapV2Router(dexRouters[sellDex]).swapExactTokensForTokens(
            usdcAmount,
            0, // Sem garantia de mínimo para simplificar
            sellPath,
            address(this),
            deadline
        );
        
        // Neste ponto, devemos ter mais tokens do que começamos,
        // representando o lucro da arbitragem
    }
    
    /**
     * @dev Distribui os lucros conforme configuração
     * @param token Endereço do token de lucro
     * @param recipients Endereços dos destinatários
     * @param names Nomes dos destinatários
     * @param percentages Percentuais para cada destinatário (em base 10000, ex: 5000 = 50%)
     */
    function distributeProfits(
        address token,
        address[] calldata recipients,
        string[] calldata names,
        uint256[] calldata percentages
    ) external onlyOwner {
        require(recipients.length == percentages.length, "ArbitrageFlashLoan: array length mismatch");
        require(recipients.length == names.length, "ArbitrageFlashLoan: array length mismatch");
        
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "ArbitrageFlashLoan: no tokens to distribute");
        
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < percentages.length; i++) {
            totalPercentage += percentages[i];
        }
        require(totalPercentage == 10000, "ArbitrageFlashLoan: percentages must sum to 100%");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            uint256 percentage = percentages[i];
            string memory name = names[i];
            
            uint256 amount = (balance * percentage) / 10000;
            if (amount > 0) {
                IERC20(token).transfer(recipient, amount);
                emit ProfitDistributed(recipient, name, amount);
            }
        }
    }
    
    // Função para receber ETH
    receive() external payable {}
}