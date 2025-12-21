# Sistema de Cotações - Documentação Técnica

## ✅ Componentes Implementados

### 1. **SolicitarCotacaoComponent** (Criar Cotação - EMPRESA)
- **Localização**: `src/app/components/solicitar-cotacao/`
- **Rota**: `/solicitar-cotacao`
- **Perfil**: EMPRESA
- **Funcionalidades**:
  - ✅ MatStepper com 2 etapas:
    1. **Informações da Cotação**: Nome, descrição, prazo de resposta
    2. **Detalhes Adicionais**: Especificações técnicas e requisitos
  - ✅ Validação de campos (mínimo 5 caracteres para nome, 10 para descrição)
  - ✅ Loading spinner durante envio
  - ✅ MatSnackBar para feedback de sucesso/erro
  - ✅ Navegação linear entre etapas
  - ✅ Validação em tempo real com mensagens de erro

### 2. **NegociarCotacaoComponent** (Chat de Negociação - FORNECEDOR)
- **Localização**: `src/app/components/negociar-cotacao/`
- **Rota**: `/negociar-cotacao/:id`
- **Perfil**: FORNECEDOR
- **Funcionalidades**:
  - ✅ Interface de chat estilo WhatsApp
  - ✅ MatList para exibição de mensagens
  - ✅ Diferenciação visual entre mensagens enviadas e recebidas
  - ✅ Timestamps formatados (HH:mm)
  - ✅ Persistência no localStorage (`cotacao_history_{cotacaoId}`)
  - ✅ Auto-scroll para última mensagem
  - ✅ Validação mínima de 10 caracteres
  - ✅ Suporte para Ctrl+Enter para enviar
  - ✅ MatSnackBar com tratamento específico de erros:
    - 404: "Cotação não encontrada"
    - 403: "Sem permissão para negociar"
    - 401: "Fornecedor não encontrado"
  - ✅ Estado vazio com ícone e mensagem

### 3. **CotacaoInputComponent** (Buscar por UUID - FORNECEDOR)
- **Localização**: `src/app/components/cotacao-input/`
- **Rota**: `/fornecedor/buscar-cotacao`
- **Perfil**: FORNECEDOR
- **Funcionalidades**:
  - ✅ Validação de UUID com regex pattern
  - ✅ Formato esperado: `550e8400-e29b-41d4-a716-446655440000`
  - ✅ Botão "Colar" para área de transferência
  - ✅ Navegação automática para `/fornecedor/cotacao/{uuid}`
  - ✅ Card informativo com instruções de uso
  - ✅ Exemplo visual de UUID válido
  - ✅ MatSnackBar para feedback de validação
  - ✅ Design responsivo

## 🗂️ Estrutura de Dados

### LocalStorage - Histórico de Negociações
```typescript
interface ChatMessage {
  texto: string;
  timestamp: Date;
  tipo: 'enviada' | 'recebida';
}

// Chave: `cotacao_history_{cotacaoId}`
// Valor: ChatMessage[]
```

### Validações Implementadas

#### SolicitarCotacaoComponent
- **nome**: Obrigatório, mínimo 5 caracteres
- **descricao**: Obrigatório, mínimo 10 caracteres
- **prazoResposta**: Obrigatório (tipo date)
- **detalhes**: Obrigatório, mínimo 10 caracteres

#### NegociarCotacaoComponent
- **mensagem**: Obrigatório, mínimo 10 caracteres

#### CotacaoInputComponent
- **uuid**: Obrigatório, formato UUID v4 válido
  - Regex: `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`

## 🎨 Recursos de UI/UX

### Material Design Components Utilizados
- ✅ `MatStepperModule` - Fluxo em etapas
- ✅ `MatListModule` - Lista de mensagens do chat
- ✅ `MatSnackBarModule` - Notificações toast
- ✅ `MatProgressSpinnerModule` - Loading states
- ✅ `MatIconModule` - Ícones Material
- ✅ `MatCardModule` - Cards de conteúdo
- ✅ `MatFormFieldModule` - Campos de formulário
- ✅ `MatInputModule` - Inputs de texto
- ✅ `MatButtonModule` - Botões estilizados
- ✅ `MatDividerModule` - Divisores visuais

### Estilos Customizados

#### Chat de Negociação
- Mensagens enviadas: Azul (`#3f51b5`), alinhadas à direita
- Mensagens recebidas: Branco, alinhadas à esquerda
- Scrollbar customizada
- Bordas arredondadas (16px)
- Sombras sutis para profundidade

#### Stepper de Criação
- Campos outline (appearance="outline")
- Ícones de prefixo
- Hints informativos
- Validação em tempo real
- Botões com ícones e loading

## 🔐 Segurança e Validações

### Guards Aplicados
Todos os componentes estão protegidos pela cadeia de guards:
1. `authGuard` - Verifica token JWT
2. `roleGuard` - Valida perfil (FORNECEDOR/EMPRESA)
3. `profileCheckGuard` - Confirma cadastro completo

### Tratamento de Erros

#### PropostaService
Já implementado com tratamento específico para:
- **404**: Recurso não encontrado
- **403**: Sem autorização
- **401**: Autenticação falhou
- **400**: Requisição inválida
- **500**: Erro no servidor
- **0**: Erro de conexão

#### Componentes
- MatSnackBar com mensagens contextualizadas
- Classes CSS `success-snackbar` e `error-snackbar`
- Posicionamento: `end` / `top`
- Duração: 2-5 segundos

## 📍 Rotas Configuradas

```typescript
// Fornecedor
/fornecedor/buscar-cotacao      → CotacaoInputComponent
/fornecedor/cotacao/:id         → CotacaoDetailComponent
/negociar-cotacao/:id           → NegociarCotacaoComponent

// Empresa
/solicitar-cotacao              → SolicitarCotacaoComponent
```

## 🚀 Fluxos de Usuário

### EMPRESA - Criar Cotação
1. Clica em "Criar Cotação" no dashboard
2. Navega para `/solicitar-cotacao`
3. Preenche **Etapa 1**: Nome, descrição, prazo
4. Avança para **Etapa 2**: Detalhes adicionais
5. Clica em "Criar Cotação"
6. Vê loading spinner
7. Recebe confirmação via SnackBar
8. Redirecionado para `/empresa/dashboard`

### FORNECEDOR - Buscar e Negociar
1. Clica em "Buscar por UUID" no dashboard
2. Navega para `/fornecedor/buscar-cotacao`
3. Cola ou digita UUID da cotação
4. Clica em "Buscar Cotação"
5. Redirecionado para `/fornecedor/cotacao/{uuid}`
6. Visualiza detalhes e clica em "Negociar"
7. Navega para `/negociar-cotacao/{id}`
8. Interface de chat carrega histórico do localStorage
9. Digita mensagem (min. 10 caracteres)
10. Envia com botão ou Ctrl+Enter
11. Mensagem é salva no localStorage
12. Auto-scroll para última mensagem
13. Recebe confirmação via SnackBar

## 📦 Dependências Adicionadas

Nenhuma nova dependência externa foi necessária. Todos os recursos utilizados já estão disponíveis no:
- **Angular 21.0.0**
- **Angular Material 21.0.5**

## 🔄 Próximos Passos (TODO)

### Backend Integration
- [ ] Substituir simulação de envio em `SolicitarCotacaoComponent`
- [ ] Criar `CotacaoService.criarCotacao()`
- [ ] Implementar endpoint real de criação: `POST /api/v1/cotacao/criar`
- [ ] Integrar resposta do backend no chat (substituir simulação)

### Melhorias Futuras
- [ ] Adicionar upload de arquivos (especificações técnicas)
- [ ] Implementar notificações push para novas mensagens
- [ ] Adicionar indicador de "digitando..."
- [ ] Exportar histórico de negociações em PDF
- [ ] Filtros avançados na busca de cotações
- [ ] Dashboard com métricas e gráficos

## 🧪 Testando Localmente

1. **Criar Cotação (EMPRESA)**:
   ```
   Login → Empresa Dashboard → "Criar Cotação"
   Preencher formulário em 2 etapas
   ```

2. **Buscar Cotação (FORNECEDOR)**:
   ```
   Login → Fornecedor Dashboard → "Buscar por UUID"
   Colar UUID: 550e8400-e29b-41d4-a716-446655440000
   ```

3. **Negociar (FORNECEDOR)**:
   ```
   Acesse /negociar-cotacao/{id}
   Digite mensagens (abrir DevTools → Application → LocalStorage)
   Verifique chave `cotacao_history_{id}`
   ```

## 📝 Notas Técnicas

- **Auto-scroll**: Implementado com `ViewChild` + `AfterViewChecked`
- **Clipboard API**: Requer HTTPS em produção
- **Standalone Components**: Todos os componentes são standalone (Angular 21)
- **Reactive Forms**: Validação reativa com `FormBuilder`
- **Type Safety**: Interfaces TypeScript para todas as estruturas
