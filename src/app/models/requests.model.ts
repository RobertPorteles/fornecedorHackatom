import { Endereco } from './endereco.model';

export interface CadastrarFornecedorRequest {
  nome: string;
  cnpj: string;
  telefone: string;
  endereco: Endereco;
  contatos: string[];
}

export interface SolicitarCotacaoRequest {
  mensagem: string;
}

export interface NegociarCotacaoRequest {
  mensagem: string;
}
