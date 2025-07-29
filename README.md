# ZapSign Frontend - Desafio Técnico

Frontend em Angular para o sistema de gestão de documentos digitais da ZapSign, desenvolvido como parte do desafio técnico. Este projeto implementa uma interface moderna e reativa para gerenciamento de documentos, signatários e integrações com a API da ZapSign.

## 📋 Sobre o Projeto

Este frontend faz parte de uma solução completa de gestão de documentos digitais que permite:

- **Gestão de Documentos**: CRUD completo para documentos com interface fluida (SPA)
- **Integração ZapSign**: Envio automático de documentos para a API da ZapSign
- **Análise Inteligente**: Análise de conteúdo com IA para insights automáticos
- **Interface Responsiva**: Construído com Angular Material para uma UX moderna
- **Operações em Tempo Real**: Atualizações dinâmicas sem reload da página

## 🚀 Tecnologias Utilizadas

- **Angular 20.1.0** - Framework principal
- **Angular Material 20.1.3** - Componentes de UI
- **RxJS 7.8.0** - Programação reativa
- **TypeScript 5.8.2** - Tipagem estática
- **SCSS** - Estilização avançada

## 🏗️ Arquitetura do Projeto

```
src/
├── app/
│   ├── layout/                 # Layout principal da aplicação
│   ├── models/                 # Interfaces e tipos TypeScript
│   │   └── document.ts         # Modelos: Document, Signer, Company
│   ├── pages/                  # Páginas da aplicação
│   │   ├── document-list/      # Listagem de documentos
│   │   └── document-form/      # Formulário de criação/edição
│   ├── services/               # Serviços de integração
│   │   └── document.ts         # Service para comunicação com API
│   ├── app.config.ts          # Configuração da aplicação
│   ├── app.routes.ts          # Definição de rotas
│   └── app.ts                 # Componente raiz
├── styles.scss                # Estilos globais
└── index.html                 # Template principal
```

## 📦 Instalação e Setup

### Pré-requisitos

- Node.js 18+ 
- Angular CLI 20+
- Backend Django rodando em `http://localhost:8000`

### Passos para instalação

1. **Clone o repositório**
```bash
git clone https://github.com/galimarodrigues/challenge-zapsign-frontend
cd zapsign_frontend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o ambiente**
```bash
# Verifique se o backend está rodando em http://localhost:8000
# O frontend está configurado para se comunicar com essa URL
```

4. **Execute a aplicação**
```bash
npm start
# ou
ng serve
```

A aplicação estará disponível em `http://localhost:4200`

## 🎯 Funcionalidades Implementadas

### 1. Dashboard de Documentos
- **Rota**: `/documents`
- **Funcionalidades**:
  - Listagem de todos os documentos
  - Visualização de status em tempo real
  - Busca e filtros por empresa
  - Cards responsivos com informações detalhadas
  - Estados de loading e empty state

### 2. Criação de Documentos
- **Rota**: `/documents/new`
- **Funcionalidades**:
  - Formulário reativo com validação
  - Seleção de empresa
  - Upload de URL do PDF
  - Dados do signatário (nome e email)
  - Integração automática com ZapSign API
  - Feedback visual de sucesso/erro

### 3. Edição de Documentos
- **Rota**: `/documents/edit/:id`
- **Funcionalidades**:
  - Pré-preenchimento do formulário
  - Atualização em tempo real
  - Preservação de dados da ZapSign

### 4. Análise Inteligente
- **Funcionalidade**: Análise de documentos com IA
- **Integração**: Endpoint dedicado para análise
- **Benefícios**: Insights automáticos sobre conteúdo

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm start                    # Inicia servidor de desenvolvimento
npm run build               # Build de produção
npm run watch               # Build em modo watch
npm test                    # Executa testes unitários

# Angular CLI
ng serve                    # Servidor de desenvolvimento
ng build                    # Build da aplicação
ng test                     # Testes com Karma/Jasmine
ng generate component       # Gera novos componentes
```

## 🌐 Endpoints e Integrações

### Comunicação com Backend

O frontend consome as seguintes APIs do backend Django:

```typescript
// Documentos
GET    /api/documents/              # Lista documentos
POST   /api/documents/              # Cria documento
GET    /api/documents/{id}/         # Busca documento específico
PUT    /api/documents/{id}/         # Atualiza documento
DELETE /api/documents/{id}/         # Remove documento

// Empresas
GET    /api/companies/              # Lista empresas

// Análise IA
POST   /api/analyzer/create/        # Solicita análise de documento
```

### Fluxo de Integração com ZapSign

1. **Criação no Frontend**: Usuário preenche formulário
2. **Envio para Backend**: Dados são enviados via POST
3. **Integração ZapSign**: Backend comunica com API ZapSign
4. **Retorno de Dados**: `open_id` e `token` são retornados
5. **Atualização Frontend**: Interface atualiza automaticamente

## 📱 Componentes Principais

### DocumentListComponent
```typescript
// Responsabilidades:
- Listagem de documentos
- Paginação e filtros
- Navegação para criação/edição
- Operações CRUD com feedback visual
- Estados de loading e empty state
```

### DocumentFormComponent
```typescript
// Responsabilidades:
- Formulário reativo com validação
- Modo criação e edição
- Integração com serviços
- Tratamento de erros
- Redirecionamento pós-operação
```

### DocumentService
```typescript
// Responsabilidades:
- Comunicação HTTP com backend
- Tratamento de respostas
- Logging para debugging
- Observables para reatividade
```

## 🎨 Design System

### Angular Material Components
- **mat-card**: Cards de documentos
- **mat-form-field**: Campos de formulário
- **mat-button**: Botões de ação
- **mat-progress-spinner**: Indicadores de loading
- **mat-icon**: Ícones consistentes
- **mat-snack-bar**: Notificações/feedback

## 🚀 Deployment

### Build de Produção
```bash
npm run build
# Gera arquivos otimizados em dist/
```

### Configurações de Ambiente
```typescript
// Para diferentes ambientes, configure:
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

## 📋 Checklist de Critérios Atendidos

- ✅ **Interface fluida sem reload**: SPA com navegação instantânea
- ✅ **CRUD completo**: Create, Read, Update, Delete implementados
- ✅ **Integração ZapSign**: Envio automático para API externa
- ✅ **Análise com IA**: Endpoint dedicado para análise de documentos
- ✅ **Interface responsiva**: Angular Material + SCSS responsivo
- ✅ **Feedback visual**: Loading states, success/error messages
- ✅ **Arquitetura limpa**: Separação clara de responsabilidades

**Desenvolvido como parte do Desafio Técnico ZapSign**  
*Sistema de gestão de documentos digitais com integração IA e automações*
