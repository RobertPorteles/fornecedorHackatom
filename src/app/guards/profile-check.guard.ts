import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FornecedorService } from '../services/fornecedor.service';
import { Perfil } from '../models/perfil.model';
import { map, catchError, of } from 'rxjs';

export const profileCheckGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const fornecedorService = inject(FornecedorService);
  const router = inject(Router);

  const userPerfil = authService.getUserPerfil();

  if (!userPerfil) {
    router.navigate(['/login']);
    return of(false);
  }

  // Se já está na rota de cadastro, permitir acesso
  if (state.url.includes('/cadastro')) {
    return of(true);
  }

  // Verificar se perfil está completo
  if (userPerfil === Perfil.FORNECEDOR) {
    return fornecedorService.getFornecedorMe().pipe(
      map(() => {
        // Perfil completo, permitir acesso
        return true;
      }),
      catchError((error) => {
        if (error.status === 404) {
          // Perfil não cadastrado, permitir acesso
          console.log('📋 Fornecedor não cadastrado');
          return of(true);
        }
        // Outro erro, permitir acesso
        return of(true);
      })
    );
  } else if (userPerfil === Perfil.EMPRESA) {
    return fornecedorService.getEmpresaMe().pipe(
      map(() => {
        // Perfil completo, permitir acesso
        return true;
      }),
      catchError((error) => {
        if (error.status === 404) {
          // Perfil não cadastrado, redirecionar para cadastro
          console.log('📋 Empresa não cadastrada, redirecionando para /empresa/cadastro');
          router.navigate(['/empresa/cadastro']);
          return of(false);
        }
        // Outro erro, permitir acesso
        return of(true);
      })
    );
  }

  return of(true);
};
