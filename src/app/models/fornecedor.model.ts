import { Endereco } from './endereco.model';
import { Cotacao } from './cotacao.model';

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  endereco: Endereco;
  contatos: string[];
  cotacoes?: Cotacao[];
  usuarioId?: string;
}
