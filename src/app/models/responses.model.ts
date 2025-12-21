import { Fornecedor } from './fornecedor.model';

export interface CadastroFornecedorResponse {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  contatos: string[];
  cotacoes: any[];
  usuarioId: string;
}

export interface SolicitarCotacaoResponse {
  mensagem: string;
  sucesso: boolean;
}

export interface NegociarSolicitacaoResponse {
  mensagem: string;
  sucesso: boolean;
}
