export interface LoginUsuarioRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  token: string;
  expiracao: string; // ISO date string (LocalDateTime)
}

export interface CadastrarUsuarioRequest {
  email: string;
  senha: string;
  perfil: string;
}

export interface CadastrarUsuarioResponse {
  id: string;
  email: string;
  perfil: string;
}
