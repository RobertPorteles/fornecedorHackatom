import { Routes } from '@angular/router';
import { CadastrarFornecedorComponent } from './components/cadastrar-fornecedor/cadastrar-fornecedor.component';
import { SolicitarCotacaoComponent } from './components/solicitar-cotacao/solicitar-cotacao.component';
import { NegociarCotacaoComponent } from './components/negociar-cotacao/negociar-cotacao.component';

export const routes: Routes = [
  { path: 'cadastrar-fornecedor', component: CadastrarFornecedorComponent },
  { path: 'solicitar-cotacao', component: SolicitarCotacaoComponent },
  { path: 'solicitar-cotacao/:id', component: SolicitarCotacaoComponent },
  { path: 'negociar-cotacao', component: NegociarCotacaoComponent },
  { path: 'negociar-cotacao/:id', component: NegociarCotacaoComponent },
  { path: '', redirectTo: '/cadastrar-fornecedor', pathMatch: 'full' }
];
