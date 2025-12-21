export enum Perfil {
  FORNECEDOR = 'FORNECEDOR',
  EMPRESA = 'EMPRESA'
}

export interface JwtPayload {
  sub: string;          // email
  perfil: Perfil;
  id: string;
  exp: number;          // expiration timestamp
  iat: number;          // issued at timestamp
}
