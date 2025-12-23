import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CotacaoService } from '../../../services/cotacao.service';
import { JwtPayload } from '../../../models/perfil.model';
import { ConvidarFornecedoresDialogComponent } from '../convidar-fornecedores-dialog/convidar-fornecedores-dialog.component';

interface Cotacao {
  id: string;
  nome: string;
  descricao: string;
  detalhes: string;
  prazoResposta: string;
  status: string;
  dataCreated: string;
}

@Component({
  selector: 'app-empresa-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    RouterLink
  ],
  templateUrl: './empresa-dashboard.component.html',
  styleUrls: ['./empresa-dashboard.component.css']
})
export class EmpresaDashboardComponent implements OnInit {
  currentUser: JwtPayload | null = null;
  cotacoes: Cotacao[] = [];
  propostas: any[] = [];

  constructor(
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cotacaoService: CotacaoService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('👤 Usuário Empresa:', this.currentUser);
    this.carregarCotacoes();
    this.carregarPropostas();
  }

  carregarCotacoes(): void {
    const cotacoesStorage = localStorage.getItem('cotacoes');
    if (cotacoesStorage) {
      this.cotacoes = JSON.parse(cotacoesStorage);
    }
  }

  carregarPropostas(): void {
    const propostasStorage = localStorage.getItem('propostas');
    if (propostasStorage) {
      this.propostas = JSON.parse(propostasStorage);
      console.log('📨 Propostas carregadas:', this.propostas);
    }
  }

  getPropostasPorCotacao(cotacaoId: string): any[] {
    return this.propostas.filter(p => p.cotacaoId === cotacaoId);
  }

  getNumeroPropostas(cotacaoId: string): number {
    return this.getPropostasPorCotacao(cotacaoId).length;
  }

  deletarCotacao(id: string): void {
    this.cotacoes = this.cotacoes.filter(c => c.id !== id);
    localStorage.setItem('cotacoes', JSON.stringify(this.cotacoes));
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  aceitarProposta(propostaId: string, cotacaoId: string): void {
    // Atualizar status da cotação para APROVADO
    const cotacaoIndex = this.cotacoes.findIndex(c => c.id === cotacaoId);
    if (cotacaoIndex !== -1) {
      this.cotacoes[cotacaoIndex].status = 'APROVADO';
      localStorage.setItem('cotacoes', JSON.stringify(this.cotacoes));
      console.log('✅ Cotação aprovada:', this.cotacoes[cotacaoIndex]);
    }

    this.snackBar.open('Proposta aceita! Status da cotação alterado para APROVADO.', 'Fechar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  recusarProposta(propostaId: string): void {
    // Remover proposta do array e atualizar localStorage
    this.propostas = this.propostas.filter(p => p.id !== propostaId);
    localStorage.setItem('propostas', JSON.stringify(this.propostas));
    console.log('❌ Proposta recusada e removida:', propostaId);

    this.snackBar.open('Proposta recusada e removida.', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }

  /**
   * Abrir dialog para convidar fornecedores para uma cotação
   */
  convidarFornecedores(cotacao: Cotacao): void {
    const dialogRef = this.dialog.open(ConvidarFornecedoresDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: {
        cotacaoId: cotacao.id,
        cotacaoNome: cotacao.nome
      },
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Fornecedores convidados para cotação', cotacao.id);
        // Recarregar dados se necessário
      } else {
        console.log('❌ Convite cancelado');
      }
    });
  }

  /**
   * Contar quantos fornecedores foram convidados para uma cotação
   */
  getNumeroFornecedoresConvidados(cotacaoId: string): number {
    return this.cotacaoService.listarFornecedoresConvidados(cotacaoId).length;
  }
}
