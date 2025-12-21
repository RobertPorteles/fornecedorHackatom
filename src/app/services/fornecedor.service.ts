import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const token = localStorage.getItem('auth_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  cadastrarFornecedor(request: CadastrarFornecedorRequest): Observable<CadastroFornecedorResponse> {
    return this.http.post<CadastroFornecedorResponse>(
      `${this.apiUrl}/api/v1/funcionario/cadastrar`,
      request,
      { headers: this.getHeaders() }
    );
  }

  solicitarCotacao(cotacaoId: string, request: SolicitarCotacaoRequest): Observable<SolicitarCotacaoResponse> {
    return this.http.post<SolicitarCotacaoResponse>(
      `${this.apiUrl}/api/v1/funcionario/solicitar/cotacao/${cotacaoId}`,
      request,
      { headers: this.getHeaders() }
    );
  }

  negociarCotacao(cotacaoId: string, request: NegociarCotacaoRequest): Observable<NegociarSolicitacaoResponse> {
    return this.http.post<NegociarSolicitacaoResponse>(
      `${this.apiUrl}/api/v1/funcionario/negociar/cotacao/${cotacaoId}`,
      request,
      { headers: this.getHeaders() }
    );
  }
}
