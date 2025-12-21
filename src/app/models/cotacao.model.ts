import { Fornecedor } from './fornecedor.model';

export interface Cotacao {
  id: string;
  nome: string;
  empresaId?: string;
  fornecedores?: Fornecedor[];
}
