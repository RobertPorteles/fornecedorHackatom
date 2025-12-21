import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SolicitarPropostaRequest {
  texto: string;
}

export interface SolicitarPropostaResponse {
  idCotacao: string;
}

export interface NegociarPropostaRequest {
  texto: string;
}

export interface NegociarPropostaResponse {
  idCotacao: string;
}

@Injectable({
  providedIn: 'root'
})
export class PropostaService {
  private apiUrl = environment.fornecedorApiUrl;

  constructor(private http: HttpClient) {}

  solicitarCotacao(id: string, texto: string): Observable<SolicitarPropostaResponse> {
    const request: SolicitarPropostaRequest = { texto };
    console.log(`📤 Solicitando cotação ${id}:`, request);
    
    return this.http.post<SolicitarPropostaResponse>(
      `${this.apiUrl}/api/v1/funcionario/solicitar/cotacao/${id}`,
      request
    );
  }

  negociarCotacao(id: string, texto: string): Observable<NegociarPropostaResponse> {
    const request: NegociarPropostaRequest = { texto };
    console.log(`📤 Negociando cotação ${id}:`, request);
    
    return this.http.post<NegociarPropostaResponse>(
      `${this.apiUrl}/api/v1/funcionario/negociar/cotacao/${id}`,
      request
    );
  }

  // Placeholder para buscar histórico de propostas
  getHistorico(cotacaoId: string): Observable<any[]> {
    console.log(`📥 Buscando histórico da cotação ${cotacaoId}`);
    // TODO: Implementar quando backend fornecer endpoint
    return this.http.get<any[]>(
      `${this.apiUrl}/api/v1/cotacao/${cotacaoId}/propostas`
    );
  }
}
