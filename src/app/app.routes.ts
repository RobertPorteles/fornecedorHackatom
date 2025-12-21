import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CadastroComponent } from './components/cadastro/cadastro.component';
import { CadastrarFornecedorComponent } from './components/cadastrar-fornecedor/cadastrar-fornecedor.component';
import { SolicitarCotacaoComponent } from './components/solicitar-cotacao/solicitar-cotacao.component';
import { NegociarCotacaoComponent } from './components/negociar-cotacao/negociar-cotacao.component';
import { FornecedorDashboardComponent } from './components/fornecedor/fornecedor-dashboard/fornecedor-dashboard.component';
import { EmpresaDashboardComponent } from './components/empresa/empresa-dashboard/empresa-dashboard.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { Perfil } from './models/perfil.model';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  
  // Rotas protegidas por perfil FORNECEDOR
  { 
    path: 'fornecedor/dashboard', 
    component: FornecedorDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [Perfil.FORNECEDOR] }
  },
  { 
    path: 'negociar-cotacao', 
    component: NegociarCotacaoComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [Perfil.FORNECEDOR] }
  },
  { 
    path: 'negociar-cotacao/:id', 
    component: NegociarCotacaoComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [Perfil.FORNECEDOR] }
  },

  // Rotas protegidas por perfil EMPRESA
  { 
    path: 'empresa/dashboard', 
    component: EmpresaDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [Perfil.EMPRESA] }
  },
  { 
    path: 'cadastrar-fornecedor', 
    component: CadastrarFornecedorComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [Perfil.EMPRESA] }
  },
  { 
    path: 'solicitar-cotacao', 
    component: SolicitarCotacaoComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [Perfil.EMPRESA] }
  },
  { 
    path: 'solicitar-cotacao/:id', 
    component: SolicitarCotacaoComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [Perfil.EMPRESA] }
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
