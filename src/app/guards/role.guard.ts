import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Perfil } from '../models/perfil.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar se está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Obter perfis permitidos da rota
  const allowedRoles = route.data['roles'] as Perfil[];
  
  if (!allowedRoles || allowedRoles.length === 0) {
    // Se não há restrição de perfil, permitir acesso
    return true;
  }

  // Verificar se o usuário tem algum dos perfis permitidos
  const userPerfil = authService.getUserPerfil();
  
  if (userPerfil && allowedRoles.includes(userPerfil)) {
    return true;
  }

  // Redirecionar para dashboard apropriado se não tiver permissão
  console.warn(`Acesso negado. Perfil necessário: ${allowedRoles.join(', ')}, Perfil atual: ${userPerfil}`);
  
  if (userPerfil === Perfil.FORNECEDOR) {
    router.navigate(['/fornecedor/dashboard']);
  } else if (userPerfil === Perfil.EMPRESA) {
    router.navigate(['/empresa/dashboard']);
  } else {
    router.navigate(['/login']);
  }
  
  return false;
};
