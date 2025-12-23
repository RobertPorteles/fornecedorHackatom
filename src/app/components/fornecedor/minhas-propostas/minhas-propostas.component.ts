import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../services/auth.service';

interface Proposta {
  id: string;
  cotacaoId: string;
  cotacaoNome?: string;
  fornecedorEmail: string;
  texto: string;
  dataEnvio: string;
  status?: string;
}

@Component({
  selector: 'app-minhas-propostas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RouterLink
  ],
  templateUrl: './minhas-propostas.component.html',
  styleUrls: ['./minhas-propostas.component.css']
})
export class MinhasPropostasComponent implements OnInit {
  todasPropostas: Proposta[] = [];
  propostasAceitas: Proposta[] = [];
  propostasRecusadas: Proposta[] = [];
  propostasEmAnalise: Proposta[] = [];
  isLoading = false;
  userEmail: string = '';
  debugMode = false; // Modo debug para mostrar todas as propostas

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userEmail = user?.sub || '';
    console.log('👤 Email do usuário logado:', this.userEmail);
    this.migrarPropostasAntigas(); // Migrar propostas antigas antes de carregar
    this.carregarPropostas();
  }

  /**
   * Migra propostas antigas que não possuem fornecedorEmail
   * Atribui o email do usuário atual para essas propostas
   */
  migrarPropostasAntigas(): void {
    const propostasStorage = localStorage.getItem('propostas');
    if (!propostasStorage) return;

    const propostas: Proposta[] = JSON.parse(propostasStorage);
    let migradas = 0;

    const propostasAtualizadas = propostas.map(proposta => {
      if (!proposta.fornecedorEmail) {
        migradas++;
        console.log(`🔄 Migrando proposta ID ${proposta.id} - atribuindo email: ${this.userEmail}`);
        return {
          ...proposta,
          fornecedorEmail: this.userEmail
        };
      }
      return proposta;
    });

    if (migradas > 0) {
      localStorage.setItem('propostas', JSON.stringify(propostasAtualizadas));
      console.log(`✅ Migração concluída: ${migradas} propostas atualizadas com o email do fornecedor`);
    } else {
      console.log('ℹ️ Nenhuma proposta antiga para migrar');
    }
  }

  carregarPropostas(): void {
    this.isLoading = true;

    // Carregar propostas do localStorage
    const propostasStorage = localStorage.getItem('propostas');
    if (propostasStorage) {
      const todasPropostas: Proposta[] = JSON.parse(propostasStorage);
      console.log('📦 Total de propostas no localStorage:', todasPropostas.length);
      console.log('📋 Todas as propostas:', todasPropostas);
      
      // Log de todos os emails para comparação
      console.log('📧 Emails nas propostas:', todasPropostas.map(p => p.fornecedorEmail));
      console.log('👤 Email do usuário atual:', this.userEmail);
      
      // Filtrar apenas as propostas deste fornecedor
      this.todasPropostas = todasPropostas.filter(
        p => {
          const match = p.fornecedorEmail === this.userEmail;
          if (!match) {
            console.log(`❌ Proposta não corresponde: "${p.fornecedorEmail}" !== "${this.userEmail}"`);
          }
          return match;
        }
      );
      
      // Modo debug: mostrar todas as propostas sem filtro
      if (this.debugMode) {
        console.log('🔍 MODO DEBUG: Mostrando todas as propostas sem filtro');
        this.todasPropostas = todasPropostas;
      }
      
      console.log('✅ Propostas filtradas para este fornecedor:', this.todasPropostas.length);
      console.log('✅ Propostas do usuário:', this.todasPropostas);

      // Carregar nomes das cotações
      const cotacoesStorage = localStorage.getItem('cotacoes');
      if (cotacoesStorage) {
        const cotacoes = JSON.parse(cotacoesStorage);
        this.todasPropostas = this.todasPropostas.map(proposta => ({
          ...proposta,
          cotacaoNome: cotacoes.find((c: any) => c.id === proposta.cotacaoId)?.nome || proposta.cotacaoNome || 'Cotação'
        }));
      }

      // Separar por status
      this.propostasAceitas = this.todasPropostas.filter(p => p.status === 'ACEITA');
      this.propostasRecusadas = this.todasPropostas.filter(p => p.status === 'RECUSADA');
      this.propostasEmAnalise = this.todasPropostas.filter(p => !p.status);
      
      console.log('📊 Propostas aceitas:', this.propostasAceitas.length);
      console.log('📊 Propostas recusadas:', this.propostasRecusadas.length);
      console.log('📊 Propostas em análise:', this.propostasEmAnalise.length);
    } else {
      console.log('⚠️ Nenhuma proposta encontrada no localStorage');
    }

    this.isLoading = false;
  }

  formatarData(data: string): string {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }


  toggleDebugMode(): void {
    this.debugMode = !this.debugMode;
    console.log('🔍 Modo Debug:', this.debugMode ? 'ATIVADO' : 'DESATIVADO');
    this.carregarPropostas();
  }
  verCotacao(cotacaoId: string): void {
    this.router.navigate(['/fornecedor/cotacao', cotacaoId]);
  }

  voltar(): void {
    this.router.navigate(['/fornecedor/dashboard']);
  }
}
