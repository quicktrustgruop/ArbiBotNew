// Script para deploy do contrato ArbitrageFlashLoan
require("dotenv").config();
const hre = require("hardhat");

// Endereços dos DEXs para testar em mainnet
const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 Router
const SUSHISWAP_ROUTER_ADDRESS = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"; // Sushiswap Router

async function main() {
  console.log("🚀 Iniciando deploy do contrato ArbitrageFlashLoan...");

  // Obter a conta do deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Realizando deploy com a conta: ${deployer.address}`);

  // Verificar saldo da conta
  const balance = await deployer.getBalance();
  console.log(`💰 Saldo da conta: ${hre.ethers.utils.formatEther(balance)} ETH`);

  // Factory do contrato
  const ArbitrageFlashLoan = await hre.ethers.getContractFactory("ArbitrageFlashLoan");
  
  // Deploy do contrato com os parâmetros
  console.log("⏳ Implantando contrato...");
  const arbitrageContract = await ArbitrageFlashLoan.deploy(
    UNISWAP_ROUTER_ADDRESS,
    SUSHISWAP_ROUTER_ADDRESS
  );

  // Aguardar a confirmação do deploy
  await arbitrageContract.deployed();

  console.log(`✅ Contrato ArbitrageFlashLoan implantado em: ${arbitrageContract.address}`);
  console.log("------------------------------------------------------------");
  console.log("🔍 Detalhes do contrato:");
  console.log(`   - Uniswap Router: ${UNISWAP_ROUTER_ADDRESS}`);
  console.log(`   - Sushiswap Router: ${SUSHISWAP_ROUTER_ADDRESS}`);
  console.log(`   - Owner: ${deployer.address}`);
  console.log("------------------------------------------------------------");
  
  // Executar uma operação de teste (opcional)
  console.log("🔄 Executando operação de arbitragem simulada para teste...");
  
  // Parâmetros de teste - WETH como token de exemplo
  const testTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH
  const testAmount = hre.ethers.utils.parseEther("1.0"); // 1 ETH
  
  try {
    const tx = await arbitrageContract.executeArbitrage(testTokenAddress, testAmount);
    await tx.wait();
    console.log("✅ Operação de arbitragem simulada executada com sucesso!");
  } catch (error) {
    console.error("❌ Erro na execução da operação de teste:", error.message);
  }
  
  console.log("🎉 Deploy completo e contrato pronto para uso!");
}

// Executar o script e tratar erros
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro no deploy:", error);
    process.exit(1);
  });