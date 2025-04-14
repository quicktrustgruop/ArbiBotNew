#!/usr/bin/env node
/**
 * Gerador Massivo de Bots IA Evolutivo
 * 
 * Este script gera um número massivo de bots, estratégias e otimizações
 * com execução real em produção para maximização de lucros.
 */

const { 
  iniciarSistemaEvolutivo, 
  criarLoteBots, 
  criarLoteEstrategias, 
  criarLoteOtimizacoes 
} = require('./evo_bot_system_expanded');
const fs = require('fs');
const path = require('path');

// Configurações para geração massiva
const CONFIG = {
  // Quantidades de componentes a serem gerados
  BOTS_POR_GERACAO: 1000,
  ESTRATEGIAS_POR_GERACAO: 100,
  OTIMIZACOES_POR_GERACAO: 50,
  
  // Número de gerações (para escalabilidade)
  TOTAL_GERACOES: 500000, // Para 500 bilhões de bots (500000 × 1000)
  
  // Linguagens a serem utilizadas
  LINGUAGENS: ['js', 'py', 'sol'],
  
  // Intervalo entre gerações (ms)
  INTERVALO_GERACAO: 30 * 60 * 1000, // 30 minutos
  
  // Controle de recursos
  MAX_GERACOES_POR_EXECUCAO: 10, // Limitar consumo de memória
  LIMPAR_APOS_GERACAO: true,      // Limpar após cada geração
  
  // Log e relatórios
  LOG_DIR: path.join(__dirname, 'logs'),
  REPORT_DIR: path.join(__dirname, 'reports')
};

// Criar diretórios necessários
if (!fs.existsSync(CONFIG.LOG_DIR)) {
  fs.mkdirSync(CONFIG.LOG_DIR, { recursive: true });
}

if (!fs.existsSync(CONFIG.REPORT_DIR)) {
  fs.mkdirSync(CONFIG.REPORT_DIR, { recursive: true });
}

// Função para registrar logs
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  
  console.log(logMessage);
  
  // Salvar no arquivo de log
  const logFile = path.join(CONFIG.LOG_DIR, `massive_generation_${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
}

// Função para gerar um relatório
function gerarRelatorio(geracao, resultados) {
  const timestamp = new Date().toISOString();
  const relatorio = {
    timestamp,
    geracao,
    bots: resultados.bots.length,
    estrategias: resultados.estrategias.length,
    otimizacoes: resultados.otimizacoes.length,
    totalGerado: geracao * CONFIG.BOTS_POR_GERACAO
  };
  
  // Salvar relatório
  const relatorioFile = path.join(CONFIG.REPORT_DIR, `relatorio_geracao_${geracao}.json`);
  fs.writeFileSync(relatorioFile, JSON.stringify(relatorio, null, 2));
  
  return relatorio;
}

// Função principal para execução
async function executarGeracaoMassiva() {
  log('🚀 Iniciando Geração Massiva de Bots IA Evolutivos...', 'start');
  
  log(`⚙️ Configuração:`);
  log(`   - Bots por geração: ${CONFIG.BOTS_POR_GERACAO}`);
  log(`   - Estratégias por geração: ${CONFIG.ESTRATEGIAS_POR_GERACAO}`);
  log(`   - Otimizações por geração: ${CONFIG.OTIMIZACOES_POR_GERACAO}`);
  log(`   - Total de gerações: ${CONFIG.TOTAL_GERACOES}`);
  log(`   - Meta: ${CONFIG.TOTAL_GERACOES * CONFIG.BOTS_POR_GERACAO} bots`);
  
  // Contadores
  let geracaoAtual = 0;
  let totalBotsGerados = 0;
  let geracoesNestaExecucao = 0;
  
  // Verificar se existe um estado anterior
  const estadoFile = path.join(CONFIG.REPORT_DIR, 'estado_geracao.json');
  if (fs.existsSync(estadoFile)) {
    try {
      const estadoAnterior = JSON.parse(fs.readFileSync(estadoFile, 'utf8'));
      geracaoAtual = estadoAnterior.ultimaGeracao || 0;
      totalBotsGerados = estadoAnterior.totalBotsGerados || 0;
      
      log(`📋 Estado anterior encontrado: Geração ${geracaoAtual}, ${totalBotsGerados} bots gerados`);
    } catch (error) {
      log(`❌ Erro ao ler estado anterior: ${error.message}`, 'error');
    }
  }
  
  // Função para gerar uma geração
  async function gerarGeracao() {
    geracaoAtual++;
    geracoesNestaExecucao++;
    
    log(`🔄 Iniciando geração #${geracaoAtual}...`);
    
    // Iniciar sistema evolutivo com configuração específica
    const resultados = iniciarSistemaEvolutivo({
      numBots: CONFIG.BOTS_POR_GERACAO,
      numEstrategias: CONFIG.ESTRATEGIAS_POR_GERACAO,
      numOtimizacoes: CONFIG.OTIMIZACOES_POR_GERACAO,
      linguagens: CONFIG.LINGUAGENS,
      limparExistentes: CONFIG.LIMPAR_APOS_GERACAO && geracoesNestaExecucao > 1
    });
    
    // Atualizar contadores
    totalBotsGerados += resultados.bots.length;
    
    // Gerar relatório
    const relatorio = gerarRelatorio(geracaoAtual, resultados);
    
    // Salvar estado
    const estado = {
      ultimaGeracao: geracaoAtual,
      totalBotsGerados,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(estadoFile, JSON.stringify(estado, null, 2));
    
    log(`✅ Geração #${geracaoAtual} concluída: ${resultados.bots.length} bots gerados`);
    log(`📊 Total acumulado: ${totalBotsGerados} bots (${(totalBotsGerados / (CONFIG.TOTAL_GERACOES * CONFIG.BOTS_POR_GERACAO) * 100).toFixed(8)}% da meta)`);
    
    // Verificar se atingiu o limite de gerações por execução
    if (geracoesNestaExecucao >= CONFIG.MAX_GERACOES_POR_EXECUCAO) {
      log(`⚠️ Limite de gerações por execução atingido (${CONFIG.MAX_GERACOES_POR_EXECUCAO})`);
      log('💾 Estado salvo. Execute novamente para continuar a geração.');
      return false;
    }
    
    // Verificar se atingiu o total de gerações
    if (geracaoAtual >= CONFIG.TOTAL_GERACOES) {
      log('🎉 Meta de gerações atingida!');
      log(`🏆 Total final: ${totalBotsGerados} bots gerados`);
      return false;
    }
    
    return true;
  }
  
  // Gerar primeira geração
  let continuar = await gerarGeracao();
  
  // Agendar próximas gerações
  if (continuar) {
    log(`⏱️ Próxima geração em ${CONFIG.INTERVALO_GERACAO / 60000} minutos...`);
    
    const intervalo = setInterval(async () => {
      continuar = await gerarGeracao();
      
      if (!continuar) {
        clearInterval(intervalo);
        log('👋 Processo de geração massiva finalizado');
      } else {
        log(`⏱️ Próxima geração em ${CONFIG.INTERVALO_GERACAO / 60000} minutos...`);
      }
    }, CONFIG.INTERVALO_GERACAO);
    
    // Tratar encerramento limpo
    process.on('SIGINT', () => {
      clearInterval(intervalo);
      log('⚠️ Processo interrompido pelo usuário', 'warning');
      log('💾 Estado salvo. Execute novamente para continuar a geração.');
      process.exit(0);
    });
  }
}

// Executar geração massiva
executarGeracaoMassiva().catch(error => {
  log(`❌ Erro fatal: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});