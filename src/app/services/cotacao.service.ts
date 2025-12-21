import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private apiUrl = environment.fornecedorApiUrl;

  constructor(private http: HttpClient) {}

  listarCotacoes(): Observable<Cotacao[]> {
    console.log('📥 Listando cotações disponíveis');
    return this.http.get<Cotacao[]>(
      `${this.apiUrl}/api/v1/cotacao/listar`
    );
  }

  getCotacaoById(id: string): Observable<Cotacao> {
    console.log(`📥 Buscando cotação ${id}`);
    return this.http.get<Cotacao>(
      `${this.apiUrl}/api/v1/cotacao/${id}`
    );
  }
}
