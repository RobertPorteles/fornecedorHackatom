# Portal Hackatom - Frontend Angular

Aplicação Angular completa para gerenciamento de fornecedores e cotações.

## 📋 Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   ├── login/                     # Tela de login
│   │   ├── cadastrar-fornecedor/      # Cadastro de fornecedores
│   │   ├── solicitar-cotacao/         # Solicitação de cotações
│   │   └── negociar-cotacao/          # Negociação de cotações
│   ├── models/
│   │   ├── auth.model.ts              # Models de autenticação
│   │   ├── endereco.model.ts          # Model de endereço
│   │   ├── fornecedor.model.ts        # Model de fornecedor
│   │   ├── cotacao.model.ts           # Model de cotação
│   │   ├── requests.model.ts          # DTOs de requisição
│   │   └── responses.model.ts         # DTOs de resposta
│   ├── services/
│   │   ├── auth.service.ts            # Serviço de autenticação
│   │   └── fornecedor.service.ts      # Serviço de fornecedores
│   ├── interceptors/
│   │   └── auth.interceptor.ts        # Interceptor para token JWT
│   ├── guards/
│   │   └── auth.guard.ts              # Guard de autenticação
│   ├── app.config.ts                  # Configuração da aplicação
│   ├── app.routes.ts                  # Rotas da aplicação
│   ├── app.ts                         # Componente principal
│   ├── app.html                       # Template principal
│   └── app.css                        # Estilos principais
├── environments/
│   ├── environment.ts                 # Ambiente de desenvolvimento
│   └── environment.prod.ts            # Ambiente de produção
└── main.ts                            # Bootstrap da aplicação
```

## 🚀 Instalação e Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Instalar Angular Material (se necessário)

```bash
npm install @angular/material @angular/cdk @angular/animations
```

### 3. Configurar URL da API

Edite `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'  // Altere para a URL do seu backend
};
```

### 4. Iniciar Aplicação

```bash
npm start
```

A aplicação estará disponível em `http://localhost:4200`

## 🔐 Autenticação

### Login

O sistema utiliza autenticação JWT. Após o login bem-sucedido:
- O token é armazenado em `localStorage` com a chave `auth_token`
- Todas as requisições HTTP incluem automaticamente o header `Authorization: Bearer <token>`
- O interceptor adiciona o token em todas as requisições

### Fluxo de Autenticação

1. Usuário acessa `/login`
2. Preenche email e senha
3. Sistema chama `POST /api/v1/usuarios/login`
4. Token é salvo em localStorage
5. Usuário é redirecionado para `/cadastrar-fornecedor`
6. Rotas protegidas verificam autenticação via `authGuard`

## 📡 Endpoints da API

### Autenticação

- **POST** `/api/v1/usuarios/login` - Login de usuário
  ```typescript
  Request: { email: string, senha: string }
  Response: { token: string, usuario: { id, nome, email, tipo } }
  ```

- **POST** `/api/v1/usuarios/cadastrar` - Cadastro de usuário
  ```typescript
  Request: { nome: string, email: string, senha: string, tipo?: string }
  Response: { id, nome, email, tipo }
  ```

### Fornecedores

- **POST** `/api/v1/funcionario/cadastrar` - Cadastrar fornecedor
  ```typescript
  Request: CadastrarFornecedorRequest
  Response: CadastroFornecedorResponse
  ```

- **POST** `/api/v1/funcionario/solicitar/cotacao/:cotacaoId` - Solicitar cotação
  ```typescript
  Request: SolicitarCotacaoRequest { mensagem: string }
  Response: SolicitarCotacaoResponse { mensagem, sucesso }
  ```

- **POST** `/api/v1/funcionario/negociar/cotacao/:cotacaoId` - Negociar cotação
  ```typescript
  Request: NegociarCotacaoRequest { mensagem: string }
  Response: NegociarSolicitacaoResponse { mensagem, sucesso }
  ```

## 🧭 Rotas da Aplicação

| Rota | Componente | Protegida | Descrição |
|------|------------|-----------|-----------|
| `/login` | LoginComponent | Não | Tela de login |
| `/cadastrar-fornecedor` | CadastrarFornecedorComponent | Sim | Cadastro de fornecedores |
| `/solicitar-cotacao` | SolicitarCotacaoComponent | Sim | Solicitação de cotação |
| `/solicitar-cotacao/:id` | SolicitarCotacaoComponent | Sim | Solicitação com ID pré-preenchido |
| `/negociar-cotacao` | NegociarCotacaoComponent | Sim | Negociação de cotação |
| `/negociar-cotacao/:id` | NegociarCotacaoComponent | Sim | Negociação com ID pré-preenchido |
| `/` | - | - | Redireciona para `/login` |

## 🎨 Componentes

### LoginComponent
- Formulário de login com email e senha
- Validação de campos (email válido, senha mínimo 6 caracteres)
- Feedback com MatSnackBar
- Redirecionamento após login

### CadastrarFornecedorComponent
- Formulário completo com Reactive Forms
- Campos: nome, CNPJ, telefone
- Endereço completo (logradouro, número, complemento, bairro, cidade, estado, CEP)
- Lista dinâmica de contatos (adicionar/remover)
- Validação de campos obrigatórios
- Feedback de sucesso/erro

### SolicitarCotacaoComponent
- Formulário simples com cotacaoId e mensagem
- Suporta ID por parâmetro de rota ou input manual
- Área de texto para mensagem
- Feedback de sucesso/erro

### NegociarCotacaoComponent
- Similar ao SolicitarCotacaoComponent
- Formulário para negociação
- Suporta ID por parâmetro de rota

## 🛠️ Services

### AuthService
```typescript
- login(credentials): Observable<LoginResponse>
- cadastrar(request): Observable<CadastrarUsuarioResponse>
- logout(): void
- getToken(): string | null
- isAuthenticated(): boolean
```

### FornecedorService
```typescript
- cadastrarFornecedor(request): Observable<CadastroFornecedorResponse>
- solicitarCotacao(cotacaoId, request): Observable<SolicitarCotacaoResponse>
- negociarCotacao(cotacaoId, request): Observable<NegociarSolicitacaoResponse>
```

## 🔒 Segurança

### Auth Interceptor
Adiciona automaticamente o token JWT em todas as requisições HTTP:
```typescript
Authorization: Bearer <token>
```

### Auth Guard
Protege rotas que requerem autenticação:
- Verifica se o usuário está autenticado
- Redireciona para `/login` se não autenticado

## 🎨 UI/UX

### Angular Material Components Utilizados
- `mat-card` - Cards para containers
- `mat-form-field` - Campos de formulário
- `mat-input` - Inputs de texto
- `mat-button` - Botões
- `mat-icon` - Ícones
- `mat-list` - Listas
- `mat-snack-bar` - Notificações toast

### Recursos
- Formulários reativos com validação
- Feedback visual de erros
- Loading states
- Mensagens de sucesso/erro
- Design responsivo
- Navegação condicional (mostra/esconde links baseado em autenticação)

## 📝 Models e DTOs

### Auth Models
```typescript
LoginUsuarioRequest { email, senha }
LoginResponse { token, usuario }
CadastrarUsuarioRequest { nome, email, senha, tipo? }
```

### Domain Models
```typescript
Endereco { logradouro, numero, complemento?, bairro, cidade, estado, cep }
Fornecedor { id, nome, cnpj, telefone, endereco, contatos, cotacoes?, usuarioId? }
Cotacao { id, nome, empresaId?, fornecedores? }
```

### Request Models
```typescript
CadastrarFornecedorRequest { nome, cnpj, telefone, endereco, contatos }
SolicitarCotacaoRequest { mensagem }
NegociarCotacaoRequest { mensagem }
```

### Response Models
```typescript
CadastroFornecedorResponse { id, nome, cnpj, telefone, endereco, contatos, usuarioId? }
SolicitarCotacaoResponse { mensagem, sucesso }
NegociarSolicitacaoResponse { mensagem, sucesso }
```

## 🧪 Desenvolvimento

### Comandos Úteis

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start

# Build para produção
npm run build

# Executar testes
npm test

# Verificar erros de compilação
ng build --watch
```

### Configuração do Backend

Certifique-se de que o backend esteja rodando em `http://localhost:8080` ou atualize a URL em `environment.ts`.

### CORS

O backend deve estar configurado para aceitar requisições do frontend (porta 4200 em desenvolvimento).

## 📦 Build e Deploy

### Build de Produção

```bash
npm run build
```

Os arquivos compilados estarão em `dist/portal-hackatom/`

### Configurar URL de Produção

Edite `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://seu-dominio.com'  // URL do backend em produção
};
```

## 🐛 Troubleshooting

### Erro de CORS
- Verifique se o backend permite requisições do frontend
- Configure CORS no backend para aceitar a origem do frontend

### Token não está sendo enviado
- Verifique se o token está salvo em localStorage
- Confirme que o interceptor está registrado em `app.config.ts`
- Verifique o console do navegador para erros

### Rotas protegidas não funcionam
- Confirme que o authGuard está aplicado nas rotas
- Verifique se `isAuthenticated()` retorna true
- Limpe o localStorage e faça login novamente

### Angular Material não funciona
- Execute: `npm install @angular/material @angular/cdk @angular/animations`
- Verifique se `provideAnimationsAsync()` está em `app.config.ts`

## 📄 Licença

Projeto criado para o Hackatom.
