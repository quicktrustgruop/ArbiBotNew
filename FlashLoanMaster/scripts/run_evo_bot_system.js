// Script para executar o Sistema IA Evolutivo
require('dotenv').config();
const path = require('path');
const { createBotEcosystem, initEvoBotSystem } = require('../evo_bot_system');
const fs = require('fs');

// Configurações
const CONFIG = {
  BOT_COUNT: 10,  // Número de bots a serem criados
  LOG_FOLDER: path.join(__dirname, '..', 'logs'),
  GENERATE_STRATEGIES: true,
  NETWORKS: ['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism'],
  RUNTIME_MINUTES: 60  // Tempo de execução em minutos
};

// Criar diretório de logs se não existir
if (!fs.existsSync(CONFIG.LOG_FOLDER)) {
  fs.mkdirSync(CONFIG.LOG_FOLDER, { recursive: true });
}

// Função para registrar logs
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  
  console.log(logMessage);
  
  // Salvar no arquivo de log
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const logFile = path.join(CONFIG.LOG_FOLDER, `evolution_${date}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
}

// Função principal
async function main() {
  try {
    log('🚀 Iniciando Sistema IA Evolutivo de Bots...');
    
    // Verificar variáveis de ambiente
    const requiredVars = ['PRIVATE_KEY', 'ALCHEMY_API', 'ETHEREUM_RPC_URL'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      log(`❌ Erro: Variáveis de ambiente ausentes: ${missingVars.join(', ')}`, 'error');
      return;
    }
    
    log('✅ Variáveis de ambiente verificadas');
    log(`⚙️ Configuração: Gerando ${CONFIG.BOT_COUNT} bots em ${CONFIG.NETWORKS.length} redes...`);
    
    // Inicializar o sistema de IA evolutiva
    const success = initEvoBotSystem();
    
    if (!success) {
      log('❌ Falha ao inicializar sistema IA Evolutivo', 'error');
      return;
    }
    
    log('🔄 Sistema IA Evolutivo inicializado com sucesso');
    
    // Criar os bots (a função initEvoBotSystem já faz isso, mas aqui mostramos como acessar externamente)
    if (CONFIG.GENERATE_STRATEGIES) {
      log('🧠 Gerando estratégias adicionais...');
      const bots = createBotEcosystem(CONFIG.BOT_COUNT);
      log(`✅ Gerados ${bots.length} bots adicionais`);
    }
    
    // Definir tempo de execução
    log(`⏱️ Sistema programado para rodar por ${CONFIG.RUNTIME_MINUTES} minutos`);
    
    // Simular processo evolutivo
    let iteration = 1;
    const evolutionInterval = setInterval(() => {
      log(`🧬 Ciclo evolutivo #${iteration} iniciado`);
      
      // Simular evolução: gerar novos bots a cada ciclo
      const newBots = createBotEcosystem(Math.ceil(CONFIG.BOT_COUNT / 5)); // 20% de novos bots por ciclo
      
      log(`🔄 Ciclo evolutivo #${iteration} concluído: ${newBots.length} novos bots gerados`);
      iteration++;
      
      // Parar após o número definido de ciclos
      if (iteration > 5) {
        clearInterval(evolutionInterval);
        log('🏁 Ciclos evolutivos concluídos');
        
        // Final do tempo de execução
        setTimeout(() => {
          log('⏰ Tempo de execução atingido');
          log('🔚 Finalizando sistema IA Evolutivo...');
          
          // Resumo da execução
          log('📊 RESUMO DA EXECUÇÃO');
          log(`Total de ciclos evolutivos: ${iteration - 1}`);
          log(`Bots gerados: ~${CONFIG.BOT_COUNT + (iteration - 1) * Math.ceil(CONFIG.BOT_COUNT / 5)}`);
          log(`Redes utilizadas: ${CONFIG.NETWORKS.join(', ')}`);
          
          log('🎉 Sistema IA Evolutivo finalizado com sucesso!');
          
          // Encerrar
          process.exit(0);
        }, CONFIG.RUNTIME_MINUTES * 60 * 1000);
      }
    }, 2 * 60 * 1000); // Ciclo evolutivo a cada 2 minutos
    
  } catch (error) {
    log(`❌ Erro fatal: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro não tratado:', error);
    process.exit(1);
  });
}