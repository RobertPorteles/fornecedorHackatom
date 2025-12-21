import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginUsuarioRequest, LoginResponse, CadastrarUsuarioRequest, CadastrarUsuarioResponse } from '../models/auth.model';
import { Perfil, JwtPayload } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.authApiUrl;
  private tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<JwtPayload | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Carregar usuário do token ao iniciar
    const token = this.getToken();
    if (token) {
      try {
        const payload = this.decodeToken(token);
        this.currentUserSubject.next(payload);
      } catch (error) {
        console.error('Erro ao decodificar token inicial:', error);
        this.logout();
      }
    }
  }

  login(credentials: LoginUsuarioRequest): Observable<LoginResponse> {
    const url = `${this.apiUrl}/api/v1/usuarios/login`;
    console.log('🌐 POST', url);
    console.log('📦 Body:', { email: credentials.email, senha: '***' });
    
    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap(response => {
        console.log('📥 Response recebida:', { 
          id: response.id, 
          email: response.email, 
          hasToken: !!response.token,
          expiracao: response.expiracao 
        });
        if (response.token) {
          this.setToken(response.token);
          const payload = this.decodeToken(response.token);
          this.currentUserSubject.next(payload);
          console.log('💾 Token salvo e decodificado:', { 
            perfil: payload.perfil, 
            email: payload.sub,
            id: payload.id 
          });
        }
      })
    );
  }

  cadastrar(request: CadastrarUsuarioRequest): Observable<CadastrarUsuarioResponse> {
    return this.http.post<CadastrarUsuarioResponse>(
      `${this.apiUrl}/api/v1/usuarios/cadastrar`,
      request
    );
  }

  logout(): void {
    this.removeToken();
    this.currentUserSubject.next(null);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      // Verificar se o token não expirou
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }

  decodeToken(token: string): JwtPayload {
    try {
      // Decodificar manualmente sem biblioteca externa
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      throw new Error('Token inválido');
    }
  }

  getCurrentUser(): JwtPayload | null {
    return this.currentUserSubject.value;
  }

  getUserPerfil(): Perfil | null {
    const user = this.getCurrentUser();
    return user?.perfil || null;
  }

  isFornecedor(): boolean {
    return this.getUserPerfil() === Perfil.FORNECEDOR;
  }

  isEmpresa(): boolean {
    return this.getUserPerfil() === Perfil.EMPRESA;
  }

  hasRole(role: Perfil): boolean {
    return this.getUserPerfil() === role;
  }
}
