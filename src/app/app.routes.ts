import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CadastroComponent } from './components/cadastro/cadastro.component';
import { CadastrarFornecedorComponent } from './components/cadastrar-fornecedor/cadastrar-fornecedor.component';
import { CadastroEmpresaComponent } from './components/empresa/cadastro-empresa/cadastro-empresa.component';
import { SolicitarCotacaoComponent } from './components/solicitar-cotacao/solicitar-cotacao.component';
import { NegociarCotacaoComponent } from './components/negociar-cotacao/negociar-cotacao.component';
import { CotacaoInputComponent } from './components/cotacao-input/cotacao-input.component';
import { FornecedorDashboardComponent } from './components/fornecedor/fornecedor-dashboard/fornecedor-dashboard.component';
import { EmpresaDashboardComponent } from './components/empresa/empresa-dashboard/empresa-dashboard.component';
import { ListaFornecedoresComponent } from './components/empresa/lista-fornecedores/lista-fornecedores.component';
import { CotacaoListComponent } from './components/fornecedor/cotacao-list/cotacao-list.component';
import { CotacaoDetailComponent } from './components/fornecedor/cotacao-detail/cotacao-detail.component';
import { EmpresaCotacaoDetailComponent } from './components/empresa/cotacao-detail/cotacao-detail.component';
import { EditarPerfilEmpresaComponent } from './components/empresa/editar-perfil-empresa/editar-perfil-empresa.component';
import { EditarPerfilFornecedorComponent } from './components/fornecedor/editar-perfil-fornecedor/editar-perfil-fornecedor.component';
import { MinhasPropostasComponent } from './components/fornecedor/minhas-propostas/minhas-propostas.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { profileCheckGuard } from './guards/profile-check.guard';
import { Perfil } from './models/perfil.model';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  
  // Rotas protegidas por perfil FORNECEDOR
  { 
    path: 'fornecedor/cadastro', 
    component: CadastrarFornecedorComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [Perfil.FORNECEDOR] }
  },
  { 
    path: 'fornecedor/dashboard', 
    component: FornecedorDashboardComponent,
    canActivate: [authGuard, roleGuard, profileCheckGuard],
    data: { roles: [Perfil.FORNECEDOR] }
  },
  { 
    path: 'fornecedor/cotacoes', 
    component: CotacaoListComponent,
    canActivate: [authGuard, roleGuard, profileCheckGuard],
    data: { roles: [Perfil.FORNECEDOR] }
  },
  { 
    path: 'fornecedor/cotacao/:id', 
    component: CotacaoDetailComponent,
    canActivate: [authGuard, roleGuard, profileCheckGuard],
    data: { roles: [Perfil.FORNECEDOR] }
  },
  { 
    path: 'fornecedor/buscar-cotacao', 
    component: CotacaoInputComponent,
    canActivate: [authGuard, roleGuard, profileCheckGuard],
    data: { roles: [Perfil.FORNECEDOR] }
  },
  { 
    path: 'fornecedor/minhas-propostas', 
    component: MinhasPropostasComponent,
    canActivate: [authGuard, roleGuard, profileCheckGuard],
    data: { roles: [Perfil.FORNECEDOR] }
  },
  { 
    path: 'fornecedor/editar-perfil', 
    component: EditarPerfilFornecedorComponent,
    canActivate: [authGuard, roleGuard, profileCheckGuard],
    data: { roles: [Perfil.FORNECEDOR] }
  },
  { 
    path: 'negociar-cotacao', 
    component: NegociarCotacaoComponent,
    canActivate: [authGuard, roleGuard, profileCheckGuard],
    data: { roles: [Perfil.FORNECEDOR] }
  },
  { 
    path: 'negociar-cotacao/:id', 
    component: NegociarCotacaoComponent,
    canActivate: [authGuard, roleGuard, profileCheckGuard],
    data: { roles: [Perfil.FORNECEDOR] }
  },

  // Rotas protegidas por perfil EMPRESA
  { 
    path: 'empresa/cadastro', 
    component: CadastroEmpresaComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [Perfil.EMPRESA] }
  },
  { 
    path: 'empresa/dashboard', 
    component: EmpresaDashboardComponent,
    canActivate: [authGuard, roleGuard, profileCheckGuard],
    data: { roles: [Perfil.EMPRESA] }
  },
  { 
    path: 'empresa/fornecedores', 
    component: ListaFornecedoresComponent,
    canActivate: [authGuard, roleGuard, profileCheckGuard],
    data: { roles: [Perfil.EMPRESA] }
  },
  { 
    path: 'empresa/cotacao/:id', 
    component: EmpresaCotacaoDetailComponent,
    canActivate: [authGuard, roleGuard, profileCheckGuard],
    data: { roles: [Perfil.EMPRESA] }
  },
  { 
    path: 'empresa/editar-perfil', 
    component: EditarPerfilEmpresaComponent,
    canActivate: [authGuard, roleGuard, profileCheckGuard],
    data: { roles: [Perfil.EMPRESA] }
  },
  { 
    path: 'solicitar-cotacao', 
    component: SolicitarCotacaoComponent,
    canActivate: [authGuard, roleGuard, profileCheckGuard],
    data: { roles: [Perfil.EMPRESA] }
  },
  { 
    path: 'solicitar-cotacao/:id', 
    component: SolicitarCotacaoComponent,
    canActivate: [authGuard, roleGuard, profileCheckGuard],
    data: { roles: [Perfil.EMPRESA] }
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
