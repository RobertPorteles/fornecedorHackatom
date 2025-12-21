import { Fornecedor } from './fornecedor.model';

// Enums
export enum StatusCotacao {
  ABERTA = 'ABERTA',
  ENCERRADA = 'ENCERRADA',
  CANCELADA = 'CANCELADA'
}

// Request Types
export interface CadastrarCotacaoRequest {
  nome: string;
  descricao: string;
  data: string; // formato dd/MM/yyyy
  empresaId: string; // UUID
  status: StatusCotacao;
}

export interface EditarCotacaoRequest {
  nome: string;
  descricao: string;
  data: string; // formato dd/MM/yyyy
  status: StatusCotacao;
}

export interface PropostaRequest {
  texto: string;
}

export interface SolicitarCotacaoRequest {
  texto: string;
}

// Response Types
export interface CadastrarCotacaoResponse {
  id: string;
  nome: string;
  dataLimite: string;
  status: StatusCotacao;
}

export interface BuscarCotacaoResponse {
  id: string;
  nome: string;
  fornecedoresId: string[];
  propostasId: string[];
  empresaId: string;
  dataLimite: string;
  status: StatusCotacao;
  descricaoItens: string;
}

export interface EditarCotacaoResponse {
  id: string;
  nome: string;
  dataLimite: string;
  status: StatusCotacao;
}

export interface PropostaResponse {
  id: string;
  idCotacao: string;
  texto: string;
}

export interface SolicitarCotacaoResponse {
  id: string;
  idCotacao: string;
  texto: string;
}

export interface EnderecoResponse {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface BuscarFornecedorResponse {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  endereco: EnderecoResponse;
  contatos: string[];
}

// Legacy interface for compatibility
export interface Cotacao {
  id: string;
  nome: string;
  empresaId?: string;
  fornecedores?: Fornecedor[];
  descricao?: string;
  status?: StatusCotacao;
  dataLimite?: string;
}
