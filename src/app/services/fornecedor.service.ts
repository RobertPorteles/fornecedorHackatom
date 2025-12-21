import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CadastrarFornecedorRequest,
  SolicitarCotacaoRequest,
  NegociarCotacaoRequest
} from '../models/requests.model';
import {
  CadastroFornecedorResponse,
  SolicitarCotacaoResponse,
  NegociarSolicitacaoResponse
} from '../models/responses.model';

@Injectable({
  providedIn: 'root'
})
export class FornecedorService {
  private apiUrl = environment.fornecedorApiUrl;

  constructor(private http: HttpClient) {}

  cadastrarFornecedor(request: CadastrarFornecedorRequest): Observable<CadastroFornecedorResponse> {
    return this.http.post<CadastroFornecedorResponse>(
      `${this.apiUrl}/api/v1/funcionario/cadastrar`,
      request
    );
  }

  solicitarCotacao(cotacaoId: string, request: SolicitarCotacaoRequest): Observable<SolicitarCotacaoResponse> {
    return this.http.post<SolicitarCotacaoResponse>(
      `${this.apiUrl}/api/v1/funcionario/solicitar/cotacao/${cotacaoId}`,
      request
    );
  }

  negociarCotacao(cotacaoId: string, request: NegociarCotacaoRequest): Observable<NegociarSolicitacaoResponse> {
    return this.http.post<NegociarSolicitacaoResponse>(
      `${this.apiUrl}/api/v1/funcionario/negociar/cotacao/${cotacaoId}`,
      request
    );
  }
}
