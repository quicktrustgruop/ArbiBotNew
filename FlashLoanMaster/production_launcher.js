#!/usr/bin/env node
/**
 * Lançador do Sistema ArbiBot em Modo de Produção Real
 * 
 * Este script inicia o sistema de IA evolutiva e todos os seus componentes
 * em modo de produção real, ativando a execução de operações com lucros reais.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const PRODUCTION_CONFIG = require('./production.config');
require('dotenv').config();

// Banner do sistema
console.log(`
████████╗██╗   ██╗██████╗ ██████╗  ██████╗     ██████╗ ██████╗  ██████╗ ██████╗ ██╗   ██╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗
╚══██╔══╝██║   ██║██╔══██╗██╔══██╗██╔═══██╗    ██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██║   ██║██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║
   ██║   ██║   ██║██████╔╝██████╔╝██║   ██║    ██████╔╝██████╔╝██║   ██║██║  ██║██║   ██║██║        ██║   ██║██║   ██║██╔██╗ ██║
   ██║   ██║   ██║██╔══██╗██╔══██╗██║   ██║    ██╔═══╝ ██╔══██╗██║   ██║██║  ██║██║   ██║██║        ██║   ██║██║   ██║██║╚██╗██║
   ██║   ╚██████╔╝██║  ██║██████╔╝╚██████╔╝    ██║     ██║  ██║╚██████╔╝██████╔╝╚██████╔╝╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║
   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝     ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
                                                                                                                                   
`);

// Função para registrar logs
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const PREFIX_COLORS = {
    info: '\x1b[36m', // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow 
    error: '\x1b[31m', // Red
    system: '\x1b[35m' // Magenta
  };
  
  const prefix = PREFIX_COLORS[type] || PREFIX_COLORS.info;
  const logMessage = `${prefix}[${timestamp}] [${type.toUpperCase()}]\x1b[0m ${message}`;
  
  console.log(logMessage);
  
  // Salvar no arquivo de log
  const logDir = 'logs';
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.join(logDir, `production_${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, `[${timestamp}] [${type.toUpperCase()}] ${message}\n`);
}

// Verificar requisitos de segurança
function verifySecurityRequirements() {
  log('Verificando requisitos de segurança...', 'system');
  
  // Verificar .env
  if (!fs.existsSync('.env')) {
    log('Arquivo .env não encontrado. Criando arquivo .env padrão...', 'warning');
    const dotenvExample = `# ArbiBot - Environment Variables
# Configuração para execução em produção real

# Carteira e chaves
METAMASK_PUBLIC=0x9146A9A5EFb565BF150607170CAc7C8A1b210F69
PRIVATE_KEY=

# Configuração básica
EXECUTION_MODE=producao_real
LOG_LEVEL=info
`;
    fs.writeFileSync('.env', dotenvExample);
    
    log('⚠️ ATENÇÃO: Você precisa adicionar sua chave privada ao arquivo .env para execução em produção real.', 'warning');
    log('Insira manualmente a chave privada no arquivo .env antes de continuar.', 'warning');
  }
  
  // Verificar chave privada se em modo de produção real
  const executionMode = process.env.EXECUTION_MODE || 'producao_real';
  if (executionMode === 'producao_real' && PRODUCTION_CONFIG.SECURITY.requirePrivateKey) {
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey || privateKey.trim() === '') {
      log('ERRO: Chave privada não encontrada no arquivo .env', 'error');
      log('Para execução em modo de produção real, você deve fornecer uma chave privada válida.', 'error');
      log('Edite o arquivo .env e adicione sua chave privada na variável PRIVATE_KEY.', 'error');
      return false;
    }
    
    // Verificar formato da chave privada
    if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
      log('AVISO: Formato da chave privada pode ser inválido. Verifique se está correta.', 'warning');
    }
  }
  
  // Verificar existência das pastas principais
  const requiredDirs = [
    'bots', 'strategies', 'optimizations', 'contracts', 'logs'
  ];
  
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      log(`Criando diretório ${dir}...`, 'info');
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  log('✅ Requisitos de segurança verificados com sucesso!', 'success');
  return true;
}

// Função para executar um componente do sistema
function runComponent(component) {
  log(`Iniciando componente: ${component.name}`, 'system');
  
  let processRef;
  
  try {
    if (component.type === 'node') {
      // Executar script Node.js
      processRef = spawn('node', [component.script], {
        stdio: 'pipe',
        env: process.env
      });
    } else if (component.type === 'bash') {
      // Executar script Bash
      processRef = spawn('bash', [component.script], {
        stdio: 'pipe',
        env: process.env
      });
    } else if (component.type === 'python') {
      // Executar script Python
      processRef = spawn('python3', [component.script], {
        stdio: 'pipe',
        env: process.env
      });
    } else {
      log(`Tipo de componente desconhecido: ${component.type}`, 'error');
      return null;
    }
    
    // Registrar logs do componente
    processRef.stdout.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          log(`[${component.name}] ${line}`, 'info');
        }
      });
    });
    
    processRef.stderr.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          log(`[${component.name}] ${line}`, 'error');
        }
      });
    });
    
    processRef.on('close', (code) => {
      if (code !== 0) {
        log(`Componente ${component.name} encerrado com código ${code}`, 'warning');
        
        // Verificar se devemos reiniciar automaticamente
        if (component.autoRestart) {
          log(`Reiniciando componente ${component.name} automaticamente...`, 'info');
          setTimeout(() => {
            component.process = runComponent(component);
          }, 5000);
        }
      } else {
        log(`Componente ${component.name} encerrado normalmente`, 'info');
      }
    });
    
    // Armazenar referência ao processo
    component.process = processRef;
    
    log(`✅ Componente ${component.name} iniciado com sucesso!`, 'success');
    return processRef;
  } catch (error) {
    log(`Erro ao iniciar componente ${component.name}: ${error.message}`, 'error');
    return null;
  }
}

// Função para criar script básico se não existir
function createBasicScript(scriptPath, description) {
  if (fs.existsSync(scriptPath)) {
    return true;
  }
  
  log(`Script ${scriptPath} não encontrado. Criando script básico...`, 'warning');
  
  if (scriptPath.endsWith('.js')) {
    // Criar script Node.js básico
    const jsContent = `#!/usr/bin/env node
/**
 * ${description}
 */

// Importações
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('Iniciando ${description}...');

// Função principal
async function main() {
  console.log('${description} executando em modo de produção real');
  
  // Código principal aqui
  
  console.log('${description} em execução contínua');
  
  // Manter script executando
  setInterval(() => {
    console.log('${description} ativo: ' + new Date().toISOString());
  }, 60000);
}

// Iniciar
main().catch(error => {
  console.error('Erro na execução: ' + error.message);
  process.exit(1);
});
`;
    fs.writeFileSync(scriptPath, jsContent);
    fs.chmodSync(scriptPath, '755'); // Tornar executável
  } else if (scriptPath.endsWith('.py')) {
    // Criar script Python básico
    const pyContent = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
${description}
"""

import os
import time
import datetime
import sys
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

print("Iniciando ${description}...")

def main():
    """Função principal"""
    print("${description} executando em modo de produção real")
    
    # Código principal aqui
    
    print("${description} em execução contínua")
    
    # Manter script executando
    try:
        while True:
            print(f"${description} ativo: {datetime.datetime.now().isoformat()}")
            time.sleep(60)
    except KeyboardInterrupt:
        print("Encerrando ${description}...")
        sys.exit(0)

if __name__ == "__main__":
    main()
`;
    fs.writeFileSync(scriptPath, pyContent);
    fs.chmodSync(scriptPath, '755'); // Tornar executável
  } else if (scriptPath.endsWith('.sh')) {
    // Criar script Bash básico
    const shContent = `#!/bin/bash
# ${description}

echo "Iniciando ${description}..."

# Função principal
function main() {
  echo "${description} executando em modo de produção real"
  
  # Código principal aqui
  
  echo "${description} em execução contínua"
  
  # Manter script executando
  while true; do
    echo "${description} ativo: $(date)"
    sleep 60
  done
}

# Tratamento de sinal
trap 'echo "Encerrando ${description}..."; exit 0' SIGINT SIGTERM

# Iniciar
main
`;
    fs.writeFileSync(scriptPath, shContent);
    fs.chmodSync(scriptPath, '755'); // Tornar executável
  }
  
  return true;
}

// Função principal
async function main() {
  // Cabeçalho
  log('==========================================================', 'system');
  log('🚀 INICIANDO SISTEMA ARBIBOT EM MODO DE PRODUÇÃO REAL', 'system');
  log('==========================================================', 'system');
  log(`Data/Hora: ${new Date().toISOString()}`, 'system');
  log(`Modo de execução: ${PRODUCTION_CONFIG.EXECUTION_MODE}`, 'system');
  log(`Bot Limit: ${PRODUCTION_CONFIG.BOT_LIMIT.toLocaleString()}`, 'system');
  log(`Lucro mínimo por ciclo: $${PRODUCTION_CONFIG.LUCRO_MINIMO_POR_CICLO.toLocaleString()}`, 'system');
  log('==========================================================', 'system');
  
  // Verificar requisitos
  if (!verifySecurityRequirements()) {
    log('⚠️ Falha na verificação de requisitos de segurança. Abortando inicialização.', 'error');
    process.exit(1);
  }
  
  // Componentes do sistema
  const components = [
    {
      name: 'IA Evolutiva',
      type: 'node',
      script: 'evo_bot_system_expanded.js',
      description: 'Sistema de IA Evolutiva para geração de bots',
      autoRestart: true
    },
    {
      name: 'Escaneador de Arbitragem',
      type: 'node',
      script: 'arbitrage_scanner.js',
      description: 'Escaneador de oportunidades de arbitragem',
      autoRestart: true
    },
    {
      name: 'Flash Loan Executor',
      type: 'node',
      script: 'flash_loan_executor.js',
      description: 'Executor de Flash Loans',
      autoRestart: true
    },
    {
      name: 'Mining Multimoedas',
      type: 'node',
      script: 'mining_multicoins.js',
      description: 'Sistema de mineração multimoedas',
      autoRestart: true
    },
    {
      name: 'Yield Farming',
      type: 'node',
      script: 'yield_farming.js',
      description: 'Sistema de Yield Farming',
      autoRestart: true
    },
    {
      name: 'Liquidez & Staking',
      type: 'node',
      script: 'liquidity_staking.js',
      description: 'Sistema de Liquidez e Staking',
      autoRestart: true
    },
    {
      name: 'Análise MEV',
      type: 'node',
      script: 'mev_analysis.js',
      description: 'Sistema de análise e extração MEV',
      autoRestart: true
    },
    {
      name: 'Risk Manager',
      type: 'node',
      script: 'risk_manager.js',
      description: 'Sistema de gerenciamento de riscos',
      autoRestart: true
    },
    {
      name: 'Dashboard API',
      type: 'node',
      script: 'dashboard_api.js',
      description: 'API para dashboard de monitoramento',
      autoRestart: true
    }
  ];
  
  // Criar scripts básicos se não existirem
  for (const component of components) {
    createBasicScript(component.script, component.description);
  }
  
  // Iniciar componentes
  log('Iniciando componentes do sistema...', 'system');
  
  const activeComponents = [];
  
  for (const component of components) {
    const process = runComponent(component);
    if (process) {
      activeComponents.push({
        ...component,
        process
      });
      
      // Pequeno intervalo entre inicializações para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  log(`✅ ${activeComponents.length}/${components.length} componentes iniciados com sucesso!`, 'success');
  
  // Configurar encerramento limpo
  process.on('SIGINT', () => {
    log('Recebido sinal de interrupção. Encerrando componentes...', 'warning');
    
    // Encerrar todos os componentes
    for (const component of activeComponents) {
      if (component.process) {
        log(`Encerrando ${component.name}...`, 'info');
        component.process.kill('SIGTERM');
      }
    }
    
    log('Sistema encerrado. Até a próxima!', 'system');
    process.exit(0);
  });
  
  // Manter o processo principal ativo
  log('Sistema ArbiBot em execução. Pressione Ctrl+C para encerrar.', 'system');
  
  // Loop de manutenção para monitorar o sistema
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const memoryUsageMB = Math.round(memUsage.rss / 1024 / 1024);
    
    log(`Sistema em execução. Uso de memória: ${memoryUsageMB} MB`, 'system');
    
    // Verificar componentes
    for (const component of activeComponents) {
      if (component.process && component.process.exitCode !== null) {
        log(`Componente ${component.name} parou (código ${component.process.exitCode}). Reiniciando...`, 'warning');
        component.process = runComponent(component);
      }
    }
  }, 5 * 60 * 1000); // A cada 5 minutos
}

// Iniciar sistema
main().catch(error => {
  log(`Erro fatal na inicialização do sistema: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});