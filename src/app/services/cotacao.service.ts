import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  CadastrarCotacaoRequest,
  CadastrarCotacaoResponse,
  BuscarCotacaoResponse,
  EditarCotacaoRequest,
  EditarCotacaoResponse,
  PropostaRequest,
  PropostaResponse,
  SolicitarCotacaoRequest,
  SolicitarCotacaoResponse,
  BuscarFornecedorResponse,
  StatusCotacao,
  ConvidarFornecedoresRequest,
  ConvidarFornecedoresResponse
} from '../models/cotacao.model';

export interface Cotacao {
  id: string;
  nome: string;
  descricao?: string;
  empresa?: {
    id: string;
    razaoSocial: string;
  };
  fornecedores?: Array<{
    id: string;
    nome: string;
  }>;
  status?: string;
  dataCriacao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CotacaoService {
  private apiUrlFornecedor = environment.fornecedorApiUrl;
  private apiUrlEmpresa = environment.empresaApiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Formata uma data JavaScript para o formato dd/MM/yyyy esperado pelo backend
   */
  formatarDataParaBackend(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  /**
   * POST /api/v1/cotacoes - Criar cotação
   * Validação: data no formato dd/MM/yyyy, empresaId obrigatório
   */
  criarCotacao(request: CadastrarCotacaoRequest): Observable<CadastrarCotacaoResponse> {
    console.log('📤 Criando cotação:', request);
    
    // Validar formato de data
    if (!this.validarFormatoData(request.data)) {
      return throwError(() => new Error('Formato de data inválido. Use dd/MM/yyyy'));
    }

    // Validar empresaId
    if (!request.empresaId || !this.validarUUID(request.empresaId)) {
      return throwError(() => new Error('empresaId é obrigatório e deve ser um UUID válido'));
    }

    return this.http.post<CadastrarCotacaoResponse>(
      `${this.apiUrlEmpresa}/api/v1/cotacoes`,
      request
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/cotacoes/{id} - Buscar cotação específica
   * Retorna listas de IDs de fornecedores e propostas
   */
  buscarCotacao(id: string): Observable<BuscarCotacaoResponse> {
    console.log(`📥 Buscando cotação ${id}`);
    
    if (!this.validarUUID(id)) {
      return throwError(() => new Error('ID inválido'));
    }

    return this.http.get<BuscarCotacaoResponse>(
      `${this.apiUrlEmpresa}/api/v1/cotacoes/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PUT /api/v1/cotacoes/{id} - Atualizar cotação existente
   * Atualiza nome, descrição, data e status
   */
  editarCotacao(id: string, request: EditarCotacaoRequest): Observable<EditarCotacaoResponse> {
    console.log(`✏️ Editando cotação ${id}:`, request);
    
    // Validar formato de data
    if (!this.validarFormatoData(request.data)) {
      return throwError(() => new Error('Formato de data inválido. Use dd/MM/yyyy'));
    }

    // Validar ID
    if (!this.validarUUID(id)) {
      return throwError(() => new Error('ID inválido'));
    }

    // Validar status
    if (!Object.values(StatusCotacao).includes(request.status)) {
      return throwError(() => new Error('Status inválido. Use ABERTA, ENCERRADA ou CANCELADA'));
    }

    return this.http.put<EditarCotacaoResponse>(
      `${this.apiUrlEmpresa}/api/v1/cotacoes/${id}`,
      request
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST /api/v1/funcionario/solicitar/cotacao/{id} - Solicitar participação em cotação
   * Fornecedor manifesta interesse e envia primeira proposta
   */
  solicitarParticipacaoCotacao(id: string, proposta: SolicitarCotacaoRequest): Observable<SolicitarCotacaoResponse> {
    console.log(`📨 Solicitando participação na cotação ${id}:`, proposta);
    
    if (!proposta.texto || proposta.texto.trim().length === 0) {
      return throwError(() => new Error('Texto da proposta é obrigatório'));
    }

    return this.http.post<SolicitarCotacaoResponse>(
      `${this.apiUrlFornecedor}/api/v1/funcionario/solicitar/cotacao/${id}`,
      proposta
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST /api/v1/cotacoes/negociar/{id} - Empresa envia contraproposta
   * Requer que propostas existam
   */
  negociarCotacao(id: string, proposta: PropostaRequest): Observable<PropostaResponse> {
    console.log(`💬 Negociando cotação ${id}:`, proposta);
    
    if (!this.validarUUID(id)) {
      return throwError(() => new Error('ID inválido'));
    }

    if (!proposta.texto || proposta.texto.trim().length === 0) {
      return throwError(() => new Error('Texto da proposta é obrigatório'));
    }

    return this.http.post<PropostaResponse>(
      `${this.apiUrlEmpresa}/api/v1/cotacoes/negociar/${id}`,
      proposta
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/cotacoes/listar/fornecedores/{id} - Listar fornecedores participantes
   * Retorna dados completos dos fornecedores
   */
  listarFornecedoresCotacao(id: string): Observable<BuscarFornecedorResponse[]> {
    console.log(`📋 Listando fornecedores da cotação ${id}`);
    
    if (!this.validarUUID(id)) {
      return throwError(() => new Error('ID inválido'));
    }

    return this.http.get<BuscarFornecedorResponse[]>(
      `${this.apiUrlEmpresa}/api/v1/cotacoes/listar/fornecedores/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Métodos auxiliares de validação
  private validarFormatoData(data: string): boolean {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return regex.test(data);
  }

  private validarUUID(uuid: string): boolean {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      switch (error.status) {
        case 404:
          if (error.url?.includes('/cotacoes/')) {
            errorMessage = 'Cotação não encontrada';
          } else if (error.url?.includes('/fornecedores/')) {
            errorMessage = 'Fornecedor não encontrado';
          } else {
            errorMessage = 'Recurso não encontrado';
          }
          break;
        case 400:
          errorMessage = error.error?.message || 'Dados inválidos';
          break;
        case 401:
          errorMessage = 'Não autorizado. Faça login novamente';
          break;
        case 403:
          errorMessage = 'Acesso negado';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }

    console.error('❌ Erro na requisição:', errorMessage, error);
    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error
    }));
  }

  // Métodos legados para compatibilidade
  listarCotacoes(): Observable<Cotacao[]> {
    console.log('📥 Listando cotações disponíveis');
    return this.http.get<Cotacao[]>(
      `${this.apiUrlFornecedor}/api/v1/cotacao/listar`
    );
  }

  getCotacaoById(id: string): Observable<Cotacao> {
    console.log(`📥 Buscando cotação ${id}`);
    return this.http.get<Cotacao>(
      `${this.apiUrlFornecedor}/api/v1/cotacao/${id}`
    );
  }

  /**
   * POST /api/v1/cotacao/{id}/convidar - Convidar fornecedores para cotação (MOCK)
   * Mock para desenvolvimento sem backend
   */
  convidarFornecedores(
    cotacaoId: string, 
    fornecedoresIds: string[]
  ): Observable<ConvidarFornecedoresResponse> {
    console.log(`📧 [MOCK] Convidando fornecedores para cotação ${cotacaoId}:`, fornecedoresIds);
    
    // Validações
    if (!this.validarUUID(cotacaoId)) {
      return throwError(() => new Error('ID da cotação inválido'));
    }

    if (!fornecedoresIds || fornecedoresIds.length === 0) {
      return throwError(() => new Error('Selecione ao menos um fornecedor'));
    }

    // Validar cada UUID de fornecedor
    const idsInvalidos = fornecedoresIds.filter(id => !this.validarUUID(id));
    if (idsInvalidos.length > 0) {
      return throwError(() => new Error(`IDs de fornecedores inválidos: ${idsInvalidos.join(', ')}`));
    }

    // MOCK: Simular resposta do backend
    // Em produção, descomentar a linha abaixo:
    // return this.http.post<ConvidarFornecedoresResponse>(
    //   `${this.apiUrlEmpresa}/api/v1/cotacao/${cotacaoId}/convidar`,
    //   { fornecedoresIds }
    // ).pipe(catchError(this.handleError));

    // Simular delay de rede
    return new Observable<ConvidarFornecedoresResponse>(observer => {
      setTimeout(() => {
        // Salvar convites no localStorage
        const convitesKey = `convites_${cotacaoId}`;
        const convitesExistentes = JSON.parse(localStorage.getItem(convitesKey) || '[]');
        const novosConvites = [...new Set([...convitesExistentes, ...fornecedoresIds])];
        localStorage.setItem(convitesKey, JSON.stringify(novosConvites));
        
        console.log('✅ [MOCK] Fornecedores convidados salvos no localStorage:', novosConvites);

        const response: ConvidarFornecedoresResponse = {
          cotacaoId: cotacaoId,
          fornecedoresConvidados: novosConvites,
          mensagem: `${fornecedoresIds.length} fornecedor(es) convidado(s) com sucesso!`
        };

        observer.next(response);
        observer.complete();
      }, 500); // Simular 500ms de latência
    });
  }

  /**
   * GET - Listar fornecedores convidados para uma cotação (MOCK)
   * Recupera do localStorage
   */
  listarFornecedoresConvidados(cotacaoId: string): string[] {
    const convitesKey = `convites_${cotacaoId}`;
    return JSON.parse(localStorage.getItem(convitesKey) || '[]');
  }
}
