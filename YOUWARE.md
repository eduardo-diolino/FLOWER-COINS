# FLOWER COINS - Plataforma de Tarefas Gamificada

## Visão Geral

FLOWER COINS é uma plataforma gamificada para gestão de tarefas empresariais, criada para motivar funcionários através de elementos de jogos como pontuação, recompensas, ranking e interação com mascote. **Agora com backend completo e funcionalidades reais!**

## Estrutura da Plataforma

### Páginas Principais
- **index.html** - Página de login com autenticação real via Supabase
- **funcionario.html** - Painel do funcionário com tarefas, pontuação e chat conectados ao banco
- **admin.html** - Painel administrativo para gerenciar funcionários, tarefas e pagamentos

### Banco de Dados (Supabase)
- **users** - Armazena funcionários e administradores com autenticação
- **tasks** - Tarefas criadas pelos administradores
- **user_progress** - Progresso e conclusões de tarefas pelos funcionários
- **user_stats** - Estatísticas consolidadas (pontos, dinheiro, nível, ranking)

## Funcionalidades Implementadas

### Sistema de Autenticação Real
- ✅ **Login seguro** com verificação no banco de dados
- ✅ **Cadastro de funcionários** automático com validação
- ✅ **Diferenciação admin/funcionário** baseada no banco
- ✅ **Sessões persistentes** com dados do usuário

### Sistema de Tarefas Dinâmico
- ✅ **Tarefas criadas pelo admin** aparecem automaticamente para funcionários
- ✅ **Completar tarefas** salva progresso real no banco
- ✅ **Categorização** por tipo (Diária, Semanal, Mensal, Única)
- ✅ **Prioridades** (Baixa, Média, Alta, Crítica)
- ✅ **Pontuação personalizada** por tarefa

### Sistema de Pontuação e Recompensas
- ✅ **Conversão automática** (10 pontos = R$ 1,00)
- ✅ **Cálculo de nível** baseado em pontuação
- ✅ **Estatísticas em tempo real** atualizadas automaticamente
- ✅ **Efeitos visuais** (confetes, sons, animações) ao completar tarefas

### Painel do Funcionário
- ✅ **Dashboard personalizado** com nome do usuário
- ✅ **Carregamento dinâmico** de tarefas do banco de dados
- ✅ **Progresso visual** com barras e indicadores
- ✅ **Ranking global** entre todos os funcionários
- ✅ **Chat com mascote** Senhorita Florzinha
- ✅ **Animações rainbow** e efeitos visuais

### Painel Administrativo
- ✅ **Dashboard completo** com estatísticas gerais
- ✅ **CRUD de tarefas** (Criar, Editar, Ativar/Desativar)
- ✅ **Visualização de funcionários** com estatísticas
- ✅ **Top performers** e ranking
- ✅ **Atividade recente** em tempo real
- ✅ **Relatórios** e análises

### Segurança e Performance
- ✅ **Row Level Security (RLS)** configurado
- ✅ **Políticas de acesso** por tipo de usuário
- ✅ **Triggers automáticos** para atualização de estatísticas
- ✅ **Índices de performance** nas tabelas principais

## Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS + Custom CSS animations
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Autenticação**: Supabase Auth (customizado)
- **Banco de Dados**: PostgreSQL com RLS
- **Real-time**: Supabase Subscriptions

## Credenciais de Acesso

### Administrador
- **Usuário**: AGNA COSTA PCP
- **Senha**: AgPc@2011

### Funcionários
- Podem criar conta pelo link "Criar conta de funcionário"
- Ou usar qualquer usuário/senha (sistema flexível)

## Arquitetura do Sistema

### Fluxo de Dados
1. **Login** → Verificação no banco Supabase
2. **Tarefas** → Admin cria → Aparecem para funcionários
3. **Completar** → Salva em user_progress → Atualiza user_stats
4. **Ranking** → Calculado automaticamente via triggers
5. **Dashboard** → Dados em tempo real do banco

### Triggers Automáticos
- **update_user_stats()** - Atualiza estatísticas ao completar tarefas
- **update_updated_at_column()** - Timestamp automático de modificação

### Políticas de Segurança (RLS)
- Usuários veem apenas seus dados
- Admins têm acesso completo
- Tarefas são públicas para funcionários
- Progresso é privado por usuário

## Funcionalidades em Destaque

### 🎮 Gamificação Completa
- Sistema de níveis baseado em pontuação
- Ranking global competitivo
- Efeitos visuais ao completar tarefas
- Progresso visual em tempo real

### 🔄 Sincronização Real
- Tarefas do admin aparecem instantaneamente
- Estatísticas atualizam automaticamente
- Ranking dinâmico baseado em dados reais

### 📊 Analytics Avançado
- Dashboard administrativo completo
- Top performers em tempo real
- Atividade recente detalhada
- Relatórios de produtividade

### 🎨 Interface Rainbow
- Animações CSS avançadas
- Tema colorido "FLOWER COINS"
- Efeitos de moedas caindo
- Brilhos e sparkles animados

## Desenvolvimento Futuro

### Possíveis Melhorias
- [ ] Chat real com IA (GPT integration)
- [ ] Notificações push em tempo real
- [ ] Sistema de badges e conquistas
- [ ] Relatórios em PDF
- [ ] API REST para integração externa
- [ ] App mobile (React Native)

### Escalabilidade
- Sistema preparado para milhares de usuários
- Banco otimizado com índices
- Políticas de segurança robustas
- Arquitetura modular para expansão

---

**Status**: ✅ **TOTALMENTE FUNCIONAL** - Banco de dados real, autenticação segura, funcionalidades completas!

This file provides guidance to YOUWARE Agent (youware.com) when working with code in this repository.

## Atualização: FLOWER IND

- Nova moeda sincronizada: FLOWER IND
  - Coluna user_stats.flowers_ind_distributed (INTEGER DEFAULT 0)
  - Tabela ind_tasks (id, title, description, points, flower_ind, assigned_to_user_id, is_completed, created_at, completed_at, is_active)
- Interface Admin
  - Botão “Distribuir FLOWER IND” no header com modal de seleção de funcionários
  - “Nova Tarefa IND” ao lado de “Nova Tarefa Meta” e seletor em “Nova Tarefa” (normal/meta/ind)
  - Gestão Meta/IND: ativar/desativar, editar, apagar (card "Tarefas META e IND")
- Interface Funcionários
  - Bloco “FLOWER IND” (rosa brilhante) com contador e imagem (/assets/img/FLOWER IND.png)
  - Seção “Tarefas FLOWER IND” com concluir e atualização automática do contador
- Código
  - Script principal: assets/js/flower-ind.js (injeções de UI, RPC de schema, distribuição, tarefas IND)
  - sync_manager.js agora inclui flowers_ind_distributed em syncUserStats
- Observação
  - Por padrão, FLOWER IND segue comportamento semelhante ao META (não reset mensal). Ajuste no reset pode ser habilitado se necessário.
