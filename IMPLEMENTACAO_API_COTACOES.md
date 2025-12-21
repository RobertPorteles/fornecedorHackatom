# Implementação Frontend - API de Cotações

Documentação completa dos 5 endpoints do CotacaoController implementados no serviço Angular.

## Estruturas de Dados (Types/Interfaces)

Todas as interfaces estão em `src/app/models/cotacao.model.ts`:

```typescript
// Enums
export enum StatusCotacao {
  ABERTA = 'ABERTA',
  ENCERRADA = 'ENCERRADA',
  CANCELADA = 'CANCELADA'
}

// Request Types
interface CadastrarCotacaoRequest {
  nome: string;
  descricao: string;
  data: string; // formato dd/MM/yyyy
  empresaId: string; // UUID
  status: StatusCotacao;
}

interface EditarCotacaoRequest {
  nome: string;
  descricao: string;
  data: string; // formato dd/MM/yyyy
  status: StatusCotacao;
}

interface PropostaRequest {
  texto: string;
}

// Response Types
interface CadastrarCotacaoResponse {
  id: string;
  nome: string;
  dataLimite: string;
  status: StatusCotacao;
}

interface BuscarCotacaoResponse {
  id: string;
  nome: string;
  fornecedoresId: string[];
  propostasId: string[];
  empresaId: string;
  dataLimite: string;
  status: StatusCotacao;
  descricaoItens: string;
}

interface EditarCotacaoResponse {
  id: string;
  nome: string;
  dataLimite: string;
  status: StatusCotacao;
}

interface PropostaResponse {
  id: string;
  idCotacao: string;
  texto: string;
}

interface BuscarFornecedorResponse {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  endereco: EnderecoResponse;
  contatos: string[];
}

interface EnderecoResponse {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}
```

## Implementação dos Endpoints

### 1. POST /api/v1/cotacoes - Criar Cotação

**Serviço**: `cotacaoService.criarCotacao(request)`

**Validações automáticas**:
- Formato de data dd/MM/yyyy
- empresaId obrigatório e UUID válido
- Status deve ser enum válido

**Exemplo de uso no componente**:

```typescript
import { CotacaoService } from '../../services/cotacao.service';
import { StatusCotacao, CadastrarCotacaoRequest } from '../../models/cotacao.model';

// No componente
constructor(private cotacaoService: CotacaoService) {}

criarNovaCotacao() {
  const request: CadastrarCotacaoRequest = {
    nome: 'Fornecimento de Materiais',
    descricao: 'Necessitamos de materiais elétricos',
    data: this.cotacaoService.formatarDataParaBackend(new Date('2025-12-31')),
    empresaId: '123e4567-e89b-12d3-a456-426614174000',
    status: StatusCotacao.ABERTA
  };

  this.cotacaoService.criarCotacao(request).subscribe({
    next: (response) => {
      console.log('Cotação criada:', response);
      // response.id, response.nome, response.dataLimite, response.status
    },
    error: (error) => {
      console.error('Erro:', error.message);
      // Tratamento: "Cotação não encontrada", "Empresa não encontrada", etc.
    }
  });
}
```

### 2. GET /api/v1/cotacoes/{id} - Buscar Cotação

**Serviço**: `cotacaoService.buscarCotacao(id)`

**Validações automáticas**:
- ID deve ser UUID válido

**Exemplo de uso**:

```typescript
buscarCotacaoDetalhada(cotacaoId: string) {
  this.cotacaoService.buscarCotacao(cotacaoId).subscribe({
    next: (cotacao) => {
      console.log('Cotação encontrada:', cotacao);
      console.log('Fornecedores IDs:', cotacao.fornecedoresId);
      console.log('Propostas IDs:', cotacao.propostasId);
      console.log('Empresa ID:', cotacao.empresaId);
      console.log('Data Limite:', cotacao.dataLimite);
      console.log('Status:', cotacao.status);
      console.log('Descrição:', cotacao.descricaoItens);
    },
    error: (error) => {
      if (error.status === 404) {
        console.error('Cotação não encontrada');
      }
    }
  });
}
```

### 3. PUT /api/v1/cotacoes/{id} - Atualizar Cotação

**Serviço**: `cotacaoService.editarCotacao(id, request)`

**Validações automáticas**:
- ID deve ser UUID válido
- Formato de data dd/MM/yyyy
- Status deve ser enum válido (ABERTA, ENCERRADA, CANCELADA)

**Exemplo de uso**:

```typescript
import { EditarCotacaoRequest, StatusCotacao } from '../../models/cotacao.model';

editarCotacaoExistente(cotacaoId: string) {
  const request: EditarCotacaoRequest = {
    nome: 'Fornecimento de Materiais - Atualizado',
    descricao: 'Descrição atualizada com novos requisitos',
    data: this.cotacaoService.formatarDataParaBackend(new Date('2026-01-15')),
    status: StatusCotacao.ENCERRADA
  };

  this.cotacaoService.editarCotacao(cotacaoId, request).subscribe({
    next: (response) => {
      console.log('Cotação atualizada:', response);
      // Exibir mensagem de sucesso
      this.snackBar.open('Cotação atualizada com sucesso!', 'Fechar', {
        duration: 3000
      });
    },
    error: (error) => {
      console.error('Erro ao editar:', error.message);
      this.snackBar.open(error.message, 'Fechar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  });
}
```

### 4. POST /api/v1/cotacoes/negociar/{id} - Enviar Contraproposta

**Serviço**: `cotacaoService.negociarCotacao(id, proposta)`

**Validações automáticas**:
- ID deve ser UUID válido
- Texto da proposta não pode ser vazio

**Observação**: Requer que propostas já existam na cotação.

**Exemplo de uso**:

```typescript
import { PropostaRequest } from '../../models/cotacao.model';

enviarContraproposta(cotacaoId: string, textoProposta: string) {
  const proposta: PropostaRequest = {
    texto: textoProposta
  };

  this.cotacaoService.negociarCotacao(cotacaoId, proposta).subscribe({
    next: (response) => {
      console.log('Proposta enviada:', response);
      console.log('ID da proposta:', response.id);
      console.log('ID da cotação:', response.idCotacao);
      console.log('Texto:', response.texto);
      
      this.snackBar.open('Contraproposta enviada com sucesso!', 'Fechar', {
        duration: 3000
      });
    },
    error: (error) => {
      if (error.status === 400) {
        console.error('Propostas devem existir antes de negociar');
      }
      this.snackBar.open(error.message, 'Fechar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  });
}
```

### 5. GET /api/v1/cotacoes/listar/fornecedores/{id} - Listar Fornecedores

**Serviço**: `cotacaoService.listarFornecedoresCotacao(id)`

**Validações automáticas**:
- ID deve ser UUID válido

**Retorna dados completos dos fornecedores participantes**:

**Exemplo de uso**:

```typescript
listarFornecedoresParticipantes(cotacaoId: string) {
  this.cotacaoService.listarFornecedoresCotacao(cotacaoId).subscribe({
    next: (fornecedores) => {
      console.log('Fornecedores participantes:', fornecedores.length);
      
      fornecedores.forEach(fornecedor => {
        console.log('Nome:', fornecedor.nome);
        console.log('CNPJ:', fornecedor.cnpj);
        console.log('Telefone:', fornecedor.telefone);
        console.log('Endereço:', fornecedor.endereco);
        console.log('  -', fornecedor.endereco.logradouro, fornecedor.endereco.numero);
        console.log('  -', fornecedor.endereco.bairro, fornecedor.endereco.cidade);
        console.log('  -', fornecedor.endereco.estado, 'CEP:', fornecedor.endereco.cep);
        console.log('Contatos:', fornecedor.contatos);
      });
    },
    error: (error) => {
      console.error('Erro ao listar fornecedores:', error.message);
    }
  });
}
```

## Funções Auxiliares

### Formatação de Data

```typescript
// Converter Date do JavaScript para dd/MM/yyyy
const dataFormatada = this.cotacaoService.formatarDataParaBackend(new Date('2025-12-31'));
// Resultado: "31/12/2025"
```

### Validação de UUID

```typescript
// Validação interna no serviço
// Retorna erro automaticamente se UUID for inválido
```

## Tratamento de Erros

O serviço inclui tratamento de erros centralizado com mensagens amigáveis:

```typescript
this.cotacaoService.criarCotacao(request).subscribe({
  next: (response) => { /* sucesso */ },
  error: (error) => {
    // error.status - código HTTP
    // error.message - mensagem amigável traduzida
    // error.error - resposta original do servidor
    
    switch(error.status) {
      case 404:
        console.log('Recurso não encontrado');
        break;
      case 400:
        console.log('Dados inválidos:', error.message);
        break;
      case 401:
        console.log('Não autorizado - fazer login');
        break;
      case 403:
        console.log('Acesso negado');
        break;
      case 500:
        console.log('Erro no servidor');
        break;
    }
  }
});
```

## Autenticação

Todos os endpoints requerem JWT token no header `Authorization: Bearer {token}`.

O token é adicionado automaticamente pelo `AuthInterceptor` configurado em `src/app/interceptors/auth.interceptor.ts`.

## Exemplo Completo - Componente de Negociação

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CotacaoService } from '../../services/cotacao.service';
import {
  BuscarCotacaoResponse,
  BuscarFornecedorResponse,
  PropostaRequest,
  StatusCotacao
} from '../../models/cotacao.model';

@Component({
  selector: 'app-negociar-cotacao',
  templateUrl: './negociar-cotacao.component.html'
})
export class NegociarCotacaoComponent implements OnInit {
  cotacaoId!: string;
  cotacao?: BuscarCotacaoResponse;
  fornecedores: BuscarFornecedorResponse[] = [];
  propostaForm: FormGroup;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cotacaoService: CotacaoService,
    private snackBar: MatSnackBar
  ) {
    this.propostaForm = this.fb.group({
      texto: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.cotacaoId = this.route.snapshot.params['id'];
    this.carregarCotacao();
    this.carregarFornecedores();
  }

  carregarCotacao(): void {
    this.isLoading = true;
    this.cotacaoService.buscarCotacao(this.cotacaoId).subscribe({
      next: (cotacao) => {
        this.cotacao = cotacao;
        this.isLoading = false;
        console.log('Cotação carregada:', cotacao);
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(error.message, 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  carregarFornecedores(): void {
    this.cotacaoService.listarFornecedoresCotacao(this.cotacaoId).subscribe({
      next: (fornecedores) => {
        this.fornecedores = fornecedores;
        console.log(`${fornecedores.length} fornecedores participantes`);
      },
      error: (error) => {
        console.warn('Não foi possível carregar fornecedores:', error.message);
      }
    });
  }

  enviarProposta(): void {
    if (this.propostaForm.invalid) {
      this.snackBar.open('Preencha o texto da proposta corretamente.', 'Fechar', {
        duration: 3000
      });
      return;
    }

    this.isLoading = true;
    const proposta: PropostaRequest = {
      texto: this.propostaForm.value.texto
    };

    this.cotacaoService.negociarCotacao(this.cotacaoId, proposta).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Proposta enviada com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.propostaForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(error.message, 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  encerrarCotacao(): void {
    if (!this.cotacao) return;

    const request = {
      nome: this.cotacao.nome,
      descricao: this.cotacao.descricaoItens,
      data: this.cotacao.dataLimite,
      status: StatusCotacao.ENCERRADA
    };

    this.cotacaoService.editarCotacao(this.cotacaoId, request).subscribe({
      next: (response) => {
        this.snackBar.open('Cotação encerrada com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.carregarCotacao();
      },
      error: (error) => {
        this.snackBar.open(error.message, 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
```

## Considerações Importantes

1. **Autenticação**: JWT token adicionado automaticamente pelo interceptor
2. **Formato de data**: Use sempre `cotacaoService.formatarDataParaBackend()` para converter datas
3. **Validações**: Frontend valida antes de enviar, mas backend também valida
4. **Tratamento de erros**: Use os erros retornados pelo serviço para feedback ao usuário
5. **Status**: Use sempre o enum `StatusCotacao` (ABERTA, ENCERRADA, CANCELADA)
6. **UUID**: IDs devem ser UUIDs válidos (validação automática no serviço)

## LocalStorage + Backend (Estratégia Híbrida)

O componente `solicitar-cotacao` implementa uma estratégia híbrida:

1. Salva no localStorage primeiro (garantia de dados locais)
2. Tenta enviar para o backend
3. Se o backend falhar, mantém dados no localStorage
4. Fornece feedback apropriado ao usuário

Esta abordagem garante que os dados não sejam perdidos mesmo se o backend estiver indisponível.
