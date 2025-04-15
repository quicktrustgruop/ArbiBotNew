#!/usr/bin/env node
/**
 * Lançador do Sistema ArbiBot em Modo de Produção Real
 * Este script inicia o sistema de IA evolutiva e todos os seus componentes
 * em modo de produção real, ativando a execução de operações com lucros reais.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config();

// Carregar configuração de produção
let PRODUCTION_CONFIG;
try {
  PRODUCTION_CONFIG = require('./production.config');
} catch (error) {
  console.error('\x1b[31mErro ao carregar production.config.js:\x1b[0m', error.message);
  process.exit(1);
}

// Banner
console.log(`
████████╗██╗   ██╗██████╗ ██████╗  ██████╗     ██████╗ ██████╗  ██████╗ ██████╗ ██╗   ██╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗
╚══██╔══╝██║   ██║██╔══██╗██╔══██╗██╔═══██╗    ██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██║   ██║██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║
   ██║   ██║   ██║██████╔╝██████╔╝██║   ██║    ██████╔╝██████╔╝██║   ██║██║  ██║██║   ██║██║        ██║   ██║██║   ██║██╔██╗ ██║
   ██║   ██║   ██║██╔══██╗██╔══██╗██║   ██║    ██╔═══╝ ██╔══██╗██║   ██║██║  ██║██║   ██║██║        ██║   ██║██║   ██║██║╚██╗██║
   ██║   ╚██████╔╝██║  ██║██████╔╝╚██████╔╝    ██║     ██║  ██║╚██████╔╝██████╔╝╚██████╔╝╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║
   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝     ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
`);

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const COLORS = {
    info: '\x1b[36m', success: '\x1b[32m', warning: '\x1b[33m', error: '\x1b[31m', system: '\x1b[35m'
  };
  const prefix = COLORS[type] || COLORS.info;
  console.log(`${prefix}[${timestamp}] [${type.toUpperCase()}]\x1b[0m ${message}`);

  if (!fs.existsSync('logs')) fs.mkdirSync('logs');
  const logFile = path.join('logs', `production_${timestamp.split('T')[0]}.log`);
  fs.appendFileSync(logFile, `[${timestamp}] [${type.toUpperCase()}] ${message}\n`);
}

function verifySecurityRequirements() {
  log('Verificando requisitos de segurança...', 'system');
  if (!fs.existsSync('.env')) {
    fs.writeFileSync('.env', `# ArbiBot - .env de exemplo\nMETAMASK_PUBLIC=0x...\nPRIVATE_KEY=\nEXECUTION_MODE=producao_real\nLOG_LEVEL=info\n`);
    log('Arquivo .env criado. Adicione sua chave privada.', 'warning');
  }
  if (process.env.EXECUTION_MODE === 'producao_real' && PRODUCTION_CONFIG.SECURITY?.requirePrivateKey) {
    const key = process.env.PRIVATE_KEY;
    if (!key || !key.startsWith('0x') || key.length !== 66) {
      log('Chave privada ausente ou inválida.', 'error');
      return false;
    }
  }
  ['bots', 'strategies', 'optimizations', 'contracts', 'logs'].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  });
  log('Requisitos de segurança verificados!', 'success');
  return true;
}

function runComponent(component) {
  log(`Iniciando componente: ${component.name}`, 'system');
  const proc = spawn(component.type === 'python' ? 'python3' : component.type, [component.script], {
    stdio: 'pipe', env: process.env
  });
  proc.stdout.on('data', d => d.toString().split('\n').forEach(l => l && log(`[${component.name}] ${l}`, 'info')));
  proc.stderr.on('data', d => d.toString().split('\n').forEach(l => l && log(`[${component.name}] ${l}`, 'error')));
  proc.on('close', code => {
    log(`Componente ${component.name} encerrado com código ${code}`, code ? 'warning' : 'info');
    if (code && component.autoRestart) setTimeout(() => component.process = runComponent(component), 5000);
  });
  component.process = proc;
  return proc;
}

function createBasicScript(script, description) {
  if (fs.existsSync(script)) return;
  log(`Criando script ${script}...`, 'warning');
  const content = `#!/usr/bin/env node\nconsole.log('${description} ativo: ' + new Date().toISOString());\nsetInterval(() => console.log('${description} ainda ativo'), 60000);`;
  fs.writeFileSync(script, content);
  fs.chmodSync(script, '755');
}

async function main() {
  console.log(`\n${'='.repeat(60)}\n🚀 INICIANDO SISTEMA ARBIBOT EM MODO DE PRODUÇÃO REAL\n${'='.repeat(60)}\n`);
  log(`Data/Hora: ${new Date().toISOString()}`, 'system');
  log(`Modo de execução: ${PRODUCTION_CONFIG.PRODUCTION_SETTINGS.MODE}`, 'system');
  log(`Bot Limit: ${PRODUCTION_CONFIG.PRODUCTION_SETTINGS.MAX_CONCURRENT_REQUESTS.toLocaleString()}`, 'system');
  log(`Lucro mínimo por ciclo: $${PRODUCTION_CONFIG.PRODUCTION_SETTINGS.ALERT_PROFIT_THRESHOLD.toLocaleString()}`, 'system');
  log('='.repeat(60), 'system');

  if (!verifySecurityRequirements()) return process.exit(1);

  const components = [
    { name: 'IA Evolutiva', type: 'node', script: 'evo_bot_system_expanded.js', autoRestart: true },
    { name: 'Escaneador de Arbitragem', type: 'node', script: 'arbitrage_scanner.js', autoRestart: true },
    { name: 'Flash Loan Executor', type: 'node', script: 'flash_loan_executor.js', autoRestart: true },
    { name: 'Mining Multimoedas', type: 'node', script: 'mining_multicoins.js', autoRestart: true },
    { name: 'Yield Farming', type: 'node', script: 'yield_farming.js', autoRestart: true },
    { name: 'Liquidez & Staking', type: 'node', script: 'liquidity_staking.js', autoRestart: true },
    { name: 'Análise MEV', type: 'node', script: 'mev_analysis.js', autoRestart: true },
    { name: 'Risk Manager', type: 'node', script: 'risk_manager.js', autoRestart: true },
    { name: 'Dashboard API', type: 'node', script: 'dashboard_api.js', autoRestart: true }
  ];

  components.forEach(c => createBasicScript(c.script, c.name));

  const activeComponents = [];
  for (const c of components) {
    const proc = runComponent(c);
    if (proc) {
      activeComponents.push({ ...c, process: proc });
      await new Promise(res => setTimeout(res, 2000));
    }
  }

  process.on('SIGINT', () => {
    log('Encerrando componentes...', 'warning');
    activeComponents.forEach(c => c.process?.kill('SIGTERM'));
    log('Sistema encerrado. Até a próxima!', 'system');
    process.exit(0);
  });

  setInterval(() => {
    const mem = process.memoryUsage();
    log(`Uso de memória: ${Math.round(mem.rss / 1024 / 1024)} MB`, 'system');
    activeComponents.forEach(c => {
      if (c.process && c.process.exitCode !== null) {
        log(`Componente ${c.name} caiu. Reiniciando...`, 'warning');
        c.process = runComponent(c);
      }
    });
  }, 5 * 60 * 1000);
}

main().catch(e => {
  log(`Erro fatal: ${e.message}`, 'error');
  console.error(e);
  process.exit(1);
});
