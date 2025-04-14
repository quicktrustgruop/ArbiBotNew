# 🤖 ArbiBot - Sistema IA Evolutivo para Arbitragem e Mineração

Sistema completo de arbitragem automatizada, flash loans e mineração multimoedas com IA evolutiva para maximização de lucros.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Uso](#uso)
- [Módulos Principais](#módulos-principais)
- [Segurança](#segurança)
- [Contribuições](#contribuições)

## 🔍 Visão Geral

O ArbiBot é um sistema completo que combina múltiplas estratégias para maximizar lucros no mercado de criptomoedas:

1. **Arbitragem entre DEXs e CEXs**: Identificação e execução automática de oportunidades de arbitragem entre corretoras centralizadas e descentralizadas.
2. **Flash Loans**: Alavancagem através de empréstimos instantâneos para executar arbitragens sem capital inicial significativo.
3. **Mineração Multimoedas**: Sistema de mineração simultânea de múltiplas criptomoedas para otimização de rendimentos.
4. **IA Evolutiva**: Geração e adaptação automática de bots e estratégias que evoluem com o tempo para melhorar a performance.
5. **Distribuição de Lucros**: Sistema automatizado de distribuição de lucros entre carteiras configuradas, incluindo doações para ONGs.

## ✨ Funcionalidades

- 🔄 **Arbitragem Multicamada**: Escaneamento contínuo por oportunidades entre diferentes redes e exchanges.
- 💰 **Flash Loans**: Empréstimos instantâneos para executar arbitragens sem capital inicial.
- ⛏️ **Mineração Inteligente**: Sistema adaptativo de mineração em múltiplas moedas simultaneamente.
- 🧠 **Sistema IA Evolutivo**: Bots que evoluem e melhoram suas estratégias com o tempo.
- 🔒 **Segurança Avançada**: Gerenciamento seguro de chaves privadas e APIs.
- 📊 **Dashboard em Tempo Real**: Visualização completa de operações e lucros.
- 💸 **Integração Fiat**: Sistema de saque em moeda fiduciária via Mercado Pago.
- 📱 **Compatibilidade Multi-plataforma**: Execução em nuvem, Android (Termux) e Windows.

## 🔧 Requisitos

- Node.js v16+ e npm
- Hardhat (para deploy de contratos inteligentes)
- Python 3.8+ e Flask (para o backend da dashboard)
- PostgreSQL (para armazenamento de dados)
- Chaves de API para exchanges e provedores blockchain (Alchemy, Infura)
- Carteira Ethereum com saldo para gas (para deploy de contratos)

## 🚀 Instalação

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/arbibot.git
   cd arbibot
   ```

2. **Instale as dependências**:
   ```bash
   # Instalar dependências Node.js
   npm install

   # Instalar dependências Python
   pip install -r requirements.txt
   ```

3. **Configure o arquivo .env**:
   Copie o arquivo `.env.example` para `.env` e preencha com suas chaves de API e credenciais:
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas credenciais
   ```

4. **Inicialize o banco de dados**:
   ```bash
   # Criar o banco de dados PostgreSQL
   createdb arbibot
   
   # Inicializar o banco de dados
   python init_db.py
   ```

5. **Compile os contratos inteligentes**:
   ```bash
   npx hardhat compile
   ```

## 🚦 Uso

### Dashboard Web

```bash
# Iniciar o servidor Flask (backend)
python main.py

# O dashboard estará disponível em http://localhost:5000
```

### Sistema IA Evolutivo

```bash
# Iniciar o sistema IA evolutivo para geração de bots
node scripts/run_evo_bot_system.js
```

### Arbitragem com Flash Loans

```bash
# Realizar deploy do contrato de Flash Loan
npx hardhat run scripts/deploy_arbitrage.js --network mainnet

# Executar scanner de arbitragem
node scripts/run_arbitrage_scanner.js
```

### Mineração Multimoedas

```bash
# Iniciar o sistema de mineração multimoedas
node scripts/run_mining_bot.js
```

## 📁 Módulos Principais

- **evo_bot_system.js**: Sistema IA evolutivo para criação e gerenciamento de bots.
- **blockchain_connector.py**: Gerenciamento de conexões a múltiplas redes blockchain.
- **arbitrage_scanner.py**: Escaneamento contínuo por oportunidades de arbitragem.
- **flash_loan_executor.py**: Execução de flash loans para arbitragem alavancada.
- **security.py**: Sistema de segurança para proteção de chaves privadas e APIs.
- **models.py**: Modelos de dados para o armazenamento no PostgreSQL.

## 🔐 Segurança

- **Armazenamento Seguro de Chaves**: Todas as chaves privadas e API keys são armazenadas de forma segura.
- **Verificação de Integridade**: O sistema verifica continuamente a integridade das configurações.
- **Monitoramento de Riscos**: Avaliação constante de riscos antes da execução de transações.
- **Proteção Multicamadas**: Sistemas redundantes de segurança para proteção dos fundos.

⚠️ **AVISO**: Nunca compartilhe seu arquivo .env ou chaves privadas. Recomendamos começar com pequenos valores até compreender completamente o funcionamento do sistema.

## 💡 Dicas de Configuração

1. **Comece em Testnet**: Antes de usar o sistema em redes principais, teste em redes de teste.
2. **Ajuste os Limites de Risco**: Configure os limites de risco no arquivo `risk_manager.py`.
3. **Distribua os Fundos**: Não concentre todos os fundos em uma única carteira.
4. **Monitore o Desempenho**: Acompanhe regularmente o desempenho dos bots e ajuste as estratégias.

## 📊 Exemplos de Performance

```
| Estratégia        | ROI Médio (24h) | Risco |
|-------------------|-----------------|-------|
| Arbitragem DEX    | 0.5% - 3%       | Baixo |
| Flash Loan Arb    | 1% - 8%         | Médio |
| Mineração BTC     | 0.1% - 0.3%     | Baixo |
| Mineração ETH     | 0.2% - 0.5%     | Baixo |
| IA Evolutiva      | 2% - 15%        | Alto  |
```

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📜 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

⚠️ **Disclaimer**: Este software é fornecido "como está", sem garantias. O trading e mineração de criptomoedas envolvem riscos. Use por sua conta e risco. Os autores não são responsáveis por perdas financeiras decorrentes do uso deste sistema.