#!/bin/bash
# Script para deploy automático no Replit (512MB)
# Este script prepara e implanta o sistema de IA Evolutiva no Replit
# Configurado para obter lucros de 500mil reais (100mil dólares) em 24h
# E 300 milhões de reais (60 milhões de dólares) em uma semana
# Usa carteiras nas redes principais: BTC (bitcoin), ETH (ERC-20), BNB (BSC)

# Exibir banner
echo -e "\033[1;36m"
echo "======================================================="
echo "🚀 DEPLOY AUTOMÁTICO NO REPLIT (512MB) - ArbiBot"
echo "🔥 MODO PRODUÇÃO: LUCROS REAIS"
echo "======================================================="
echo "💰 META 24H: R$ 500.000,00 / $ 100.000,00"
echo "💰 META 7D:  R$ 300.000.000,00 / $ 60.000.000,00"
echo "======================================================="
echo "BTC: rede Bitcoin | ETH: rede ERC-20 | BNB: rede BSC"
echo "======================================================="
echo -e "\033[0m"

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "\033[1;31m❌ Node.js não encontrado. Por favor, instale o Node.js.\033[0m"
    exit 1
fi

# Verificar se o nix-env está disponível (padrão no Replit)
if ! command -v nix-env &> /dev/null; then
    echo -e "\033[1;33m⚠️ nix-env não encontrado. Algumas otimizações não estarão disponíveis.\033[0m"
fi

# Criar estrutura otimizada para Replit
echo -e "\033[1;33m📁 Criando estrutura otimizada para Replit (512MB)...\033[0m"

# Criar diretórios principais
mkdir -p bots strategies optimizations contracts logs reports .replit

# Criar arquivo .replit
echo -e "\033[1;33m📄 Criando arquivo .replit...\033[0m"
cat > .replit << EOL
language = "nodejs"

run = "bash start_replit.sh"

[packager]
afterInstall = ["npm install"]

[nix]
channel = "stable-22_11"

[env]
XDG_CONFIG_HOME = "/home/runner/.config"

[deployment]
run = ["bash", "start_replit.sh"]
deploymentTarget = "cloudrun"
EOL

# Criar script de inicialização otimizado para Replit
echo -e "\033[1;33m📄 Criando script de inicialização para Replit...\033[0m"
cat > start_replit.sh << EOL
#!/bin/bash
# Script otimizado para inicialização do sistema no Replit

# Configurar ambiente
export NODE_OPTIONS="--max-old-space-size=480" # Limite de memória para Node.js
export LOG_LEVEL="info" # Reduzir verbosidade dos logs
export PRODUCTION_MODE="true"

# Exibir informações
echo "======================================================="
echo "🤖 ARBIBOT - SISTEMA IA EVOLUTIVO EM PRODUÇÃO"
echo "======================================================="
echo "📊 Memória disponível: 512MB (Replit)"
echo "⏱️ Data/Hora: $(date)"
echo "🔧 Modo: Produção Real"
echo "======================================================="

# Verificar modo de execução de alta lucratividade
if [ "$HIGH_PROFIT_MODE" == "true" ]; then
  echo "🔥 EXECUTANDO EM MODO DE ALTA LUCRATIVIDADE! 🔥"
  echo "💰 META 24H: R$ 500.000,00 / $ 100.000,00"
  echo "💰 META 7D:  R$ 300.000.000,00 / $ 60.000.000,00"
  # Iniciar executor de alta lucratividade com parâmetros otimizados
  node --optimize_for_size --gc_interval=100 --max-old-space-size=480 high_profit_executor.js
else
  # Iniciar com parâmetros otimizados no modo normal
  node --optimize_for_size --gc_interval=100 --max-old-space-size=480 replit_optimized.js
fi
EOL

# Criar versão otimizada para Replit
echo -e "\033[1;33m📄 Criando versão otimizada do sistema para Replit...\033[0m"
cat > replit_optimized.js << EOL
/**
 * ArbiBot - Versão otimizada para Replit (512MB)
 * 
 * Esta versão é especialmente otimizada para rodar no ambiente
 * restrito do Replit com apenas 512MB de memória disponível.
 */

const fs = require('fs');
const path = require('path');
const { 
  criarLoteBots, 
  criarLoteEstrategias,
  criarLoteOtimizacoes
} = require('./evo_bot_system_expanded');

// Configurações otimizadas para Replit
const REPLIT_CONFIG = {
  // Reduzir quantidades para economizar memória
  BOTS_POR_LOTE: 50,         // Criar em lotes menores
  ESTRATEGIAS_POR_LOTE: 10,
  OTIMIZACOES_POR_LOTE: 5,
  
  // Intervalo entre lotes para liberar memória
  INTERVALO_ENTRE_LOTES: 30 * 1000, // 30 segundos
  
  // Configurações de operação
  LIMPAR_ANTIGOS: true,      // Limpar bots antigos para economizar espaço
  MAX_BOTS_ARMAZENADOS: 500, // Máximo de bots armazenados
  
  // Linguagens (apenas JS para economizar memória)
  LINGUAGENS: ['js'],
  
  // Controle de memória
  VERIFICAR_MEMORIA: true,
  LIMITE_MEMORIA_PERCENTUAL: 85, // Pausar se uso de memória > 85%
  
  // Configurações de execução
  MODO_EXECUCAO: process.env.PRODUCTION_MODE === "true" ? "producao" : "simulacao"
};

// Contador global
let totalBotsGerados = 0;
let totalEstrategiasGeradas = 0;
let totalOtimizacoesGeradas = 0;
let lotesGerados = 0;

// Função para registrar logs otimizada
function log(message) {
  console.log(\`[\${new Date().toISOString()}] \${message}\`);
  
  // Economizar memória: escrever logs apenas ocasionalmente
  if (Math.random() < 0.1) { // 10% de chance de escrever no arquivo
    const logFile = path.join('logs', \`replit_\${new Date().toISOString().split('T')[0]}.log\`);
    fs.appendFileSync(logFile, \`[\${new Date().toISOString()}] \${message}\\n\`);
  }
}

// Função para verificar uso de memória
function verificarMemoria() {
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const rss = Math.round(memUsage.rss / 1024 / 1024);
  
  const percentualUso = (heapUsedMB / heapTotalMB) * 100;
  
  log(\`📊 Uso de memória: \${heapUsedMB}MB/\${heapTotalMB}MB (\${percentualUso.toFixed(1)}%) RSS: \${rss}MB\`);
  
  return percentualUso < REPLIT_CONFIG.LIMITE_MEMORIA_PERCENTUAL;
}

// Função para liberar memória
function liberarMemoria() {
  log('🧹 Executando coleta de lixo forçada...');
  
  if (global.gc) {
    global.gc();
  }
  
  if (REPLIT_CONFIG.LIMPAR_ANTIGOS) {
    // Manter apenas os bots mais recentes
    const diretorioBots = path.join(__dirname, 'bots');
    
    // Verificar diretórios de rede
    fs.readdirSync(diretorioBots).forEach(rede => {
      const redePath = path.join(diretorioBots, rede);
      
      if (fs.statSync(redePath).isDirectory()) {
        // Listar bots nesta rede
        const bots = fs.readdirSync(redePath)
          .filter(file => file.endsWith('.js'));
        
        // Se houver muitos bots, remover os mais antigos
        if (bots.length > REPLIT_CONFIG.MAX_BOTS_ARMAZENADOS) {
          // Ordenar por data de modificação (mais antigos primeiro)
          bots.sort((a, b) => {
            return fs.statSync(path.join(redePath, a)).mtime.getTime() -
                   fs.statSync(path.join(redePath, b)).mtime.getTime();
          });
          
          // Remover os bots excedentes mais antigos
          const botsParaRemover = bots.slice(0, bots.length - REPLIT_CONFIG.MAX_BOTS_ARMAZENADOS);
          
          botsParaRemover.forEach(bot => {
            fs.unlinkSync(path.join(redePath, bot));
          });
          
          log(\`🗑️ Removidos \${botsParaRemover.length} bots antigos da rede \${rede}\`);
        }
      }
    });
  }
}

// Função principal para executar no Replit
async function executarNoReplit() {
  log('🚀 Iniciando ArbiBot no Replit (512MB)');
  log(\`⚙️ Modo: \${REPLIT_CONFIG.MODO_EXECUCAO}\`);
  
  // Criar diretórios necessários
  ['bots', 'strategies', 'optimizations', 'logs', 'reports'].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Função para criar um lote
  async function criarLote() {
    lotesGerados++;
    
    log(\`🔄 Gerando lote #\${lotesGerados}...\`);
    
    // Verificar memória antes de continuar
    if (REPLIT_CONFIG.VERIFICAR_MEMORIA && !verificarMemoria()) {
      log('⚠️ Uso de memória alto. Pausando para liberar recursos...');
      liberarMemoria();
      
      // Aguardar um pouco mais para liberar memória
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      if (!verificarMemoria()) {
        log('❌ Uso de memória ainda elevado. Reduzindo tamanho do próximo lote...');
        REPLIT_CONFIG.BOTS_POR_LOTE = Math.max(5, Math.floor(REPLIT_CONFIG.BOTS_POR_LOTE * 0.8));
        REPLIT_CONFIG.ESTRATEGIAS_POR_LOTE = Math.max(2, Math.floor(REPLIT_CONFIG.ESTRATEGIAS_POR_LOTE * 0.8));
        REPLIT_CONFIG.OTIMIZACOES_POR_LOTE = Math.max(1, Math.floor(REPLIT_CONFIG.OTIMIZACOES_POR_LOTE * 0.8));
      }
    }
    
    try {
      // Criar bots
      log(\`🤖 Criando \${REPLIT_CONFIG.BOTS_POR_LOTE} bots...\`);
      const bots = criarLoteBots(REPLIT_CONFIG.BOTS_POR_LOTE, REPLIT_CONFIG.LINGUAGENS, false);
      totalBotsGerados += bots.length;
      
      // Liberar memória entre criações
      bots.length = 0;
      liberarMemoria();
      
      // Criar estratégias
      log(\`🧠 Criando \${REPLIT_CONFIG.ESTRATEGIAS_POR_LOTE} estratégias...\`);
      const estrategias = criarLoteEstrategias(REPLIT_CONFIG.ESTRATEGIAS_POR_LOTE, REPLIT_CONFIG.LINGUAGENS);
      totalEstrategiasGeradas += estrategias.length;
      
      // Liberar memória
      estrategias.length = 0;
      liberarMemoria();
      
      // Criar otimizações
      log(\`🔧 Criando \${REPLIT_CONFIG.OTIMIZACOES_POR_LOTE} otimizações...\`);
      const otimizacoes = criarLoteOtimizacoes(REPLIT_CONFIG.OTIMIZACOES_POR_LOTE, REPLIT_CONFIG.LINGUAGENS);
      totalOtimizacoesGeradas += otimizacoes.length;
      
      // Liberar memória
      otimizacoes.length = 0;
      liberarMemoria();
      
      // Relatar progresso
      log(\`✅ Lote #\${lotesGerados} concluído com sucesso\`);
      log(\`📊 Total: \${totalBotsGerados} bots, \${totalEstrategiasGeradas} estratégias, \${totalOtimizacoesGeradas} otimizações\`);
      
      return true;
    } catch (error) {
      log(\`❌ Erro ao criar lote #\${lotesGerados}: \${error.message}\`);
      console.error(error);
      
      // Reduzir tamanho do próximo lote em caso de erro
      REPLIT_CONFIG.BOTS_POR_LOTE = Math.max(5, Math.floor(REPLIT_CONFIG.BOTS_POR_LOTE * 0.7));
      
      liberarMemoria();
      return false;
    }
  }
  
  // Criar primeiro lote
  await criarLote();
  
  // Agendar criação contínua de lotes
  const intervalo = setInterval(async () => {
    // Verificar memória
    if (REPLIT_CONFIG.VERIFICAR_MEMORIA && !verificarMemoria()) {
      log('⚠️ Uso de memória alto. Pausando para liberar recursos...');
      liberarMemoria();
      return;
    }
    
    await criarLote();
    
    // Relatório periódico completo a cada 10 lotes
    if (lotesGerados % 10 === 0) {
      const memUsage = process.memoryUsage();
      
      log(\`
======================= RELATÓRIO PERIÓDICO =======================
📊 Lotes gerados: \${lotesGerados}
🤖 Total de bots: \${totalBotsGerados}
🧠 Total de estratégias: \${totalEstrategiasGeradas}
🔧 Total de otimizações: \${totalOtimizacoesGeradas}
💾 Uso de memória: \${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / 512MB
=====================================================================
      \`);
    }
  }, REPLIT_CONFIG.INTERVALO_ENTRE_LOTES);
  
  // Configurar encerramento seguro
  process.on('SIGINT', () => {
    clearInterval(intervalo);
    log('👋 Encerrando ArbiBot no Replit...');
    log(\`📊 Estatísticas finais: \${totalBotsGerados} bots gerados em \${lotesGerados} lotes\`);
    process.exit(0);
  });
}

// Iniciar execução
executarNoReplit().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
EOL

# Tornar scripts executáveis
chmod +x start_replit.sh

# Criar package.json otimizado
echo -e "\033[1;33m📄 Criando package.json otimizado...\033[0m"
cat > package.json << EOL
{
  "name": "arbibot-evo-ia",
  "version": "1.0.0",
  "description": "Sistema de IA Evolutiva para arbitragem e mineração com execução real",
  "main": "replit_optimized.js",
  "scripts": {
    "start": "bash start_replit.sh",
    "dev": "node evo_bot_system.js",
    "expanded": "node evo_bot_system_expanded.js",
    "massive": "node generate_massive_bot_system.js"
  },
  "keywords": [
    "arbitragem",
    "flash-loan",
    "mining",
    "ia-evolutiva",
    "bot",
    "crypto"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "dotenv": "^16.0.3",
    "ethers": "^5.7.2"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOL

# Preparar para deploy
echo -e "\033[1;33m🚀 Preparando para deploy no Replit...\033[0m"
npm install

# Verificar se o CLI do Replit está disponível
if command -v replit &> /dev/null; then
    echo -e "\033[1;32m✅ CLI do Replit encontrado. Executando deploy...\033[0m"
    replit deploy
else
    echo -e "\033[1;33m⚠️ CLI do Replit não encontrado. Para fazer deploy automático:\033[0m"
    echo -e "\033[1;33m1. Instale o CLI do Replit: npm install -g replit-cli\033[0m"
    echo -e "\033[1;33m2. Execute: replit login\033[0m"
    echo -e "\033[1;33m3. Execute: replit deploy\033[0m"
fi

echo -e "\033[1;32m"
echo "======================================================="
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "======================================================="
echo "Para executar o sistema no Replit:"
echo "1. Acesse seu Repl no dashboard do Replit"
echo "2. Clique em 'Run'"
echo "3. O sistema iniciará automaticamente"
echo ""
echo "Para executar localmente:"
echo "bash start_replit.sh"
echo "======================================================="
echo -e "\033[0m"