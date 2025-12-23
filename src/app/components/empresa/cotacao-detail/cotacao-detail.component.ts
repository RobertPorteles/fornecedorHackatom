import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CotacaoService } from '../../../services/cotacao.service';
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

interface Proposta {
  id: string;
  cotacaoId: string;
  fornecedorEmail: string;
  texto: string;
  dataEnvio: string;
  status?: string;
}

@Component({
  selector: 'app-empresa-cotacao-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTabsModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './cotacao-detail.component.html',
  styleUrls: ['./cotacao-detail.component.css']
})
export class EmpresaCotacaoDetailComponent implements OnInit {
  cotacao: Cotacao | null = null;
  cotacaoId: string = '';
  propostas: Proposta[] = [];
  fornecedoresConvidados: string[] = [];
  isLoading = false;
  
  displayedColumns: string[] = ['fornecedor', 'texto', 'dataEnvio', 'acoes'];
  modoComparacao = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cotacaoService: CotacaoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.cotacaoId = params['id'];
      if (this.cotacaoId) {
        this.carregarDados();
      }
    });
  }

  carregarDados(): void {
    this.isLoading = true;
    
    // Carregar cotação do localStorage
    const cotacoesStorage = localStorage.getItem('cotacoes');
    if (cotacoesStorage) {
      const cotacoes: Cotacao[] = JSON.parse(cotacoesStorage);
      this.cotacao = cotacoes.find(c => c.id === this.cotacaoId) || null;
    }

    // Carregar propostas do localStorage
    const propostasStorage = localStorage.getItem('propostas');
    if (propostasStorage) {
      const todasPropostas: Proposta[] = JSON.parse(propostasStorage);
      this.propostas = todasPropostas.filter(p => p.cotacaoId === this.cotacaoId);
    }

    // Carregar fornecedores convidados
    this.fornecedoresConvidados = this.cotacaoService.listarFornecedoresConvidados(this.cotacaoId);

    this.isLoading = false;

    if (!this.cotacao) {
      this.snackBar.open('Cotação não encontrada', 'Fechar', { duration: 3000 });
      this.router.navigate(['/empresa/dashboard']);
    }
  }

  formatarData(data: string): string {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ABERTA': 'status-aberta',
      'EM_ANALISE': 'status-analise',
      'FECHADA': 'status-fechada',
      'CANCELADA': 'status-cancelada'
    };
    return statusMap[status] || 'status-aberta';
  }

  convidarFornecedores(): void {
    if (!this.cotacao) return;
    
    const dialogRef = this.dialog.open(ConvidarFornecedoresDialogComponent, {
      width: '600px',
      data: { cotacaoId: this.cotacao.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.carregarDados();
      }
    });
  }

  toggleModoComparacao(): void {
    this.modoComparacao = !this.modoComparacao;
  }

  aceitarProposta(propostaId: string): void {
    const proposta = this.propostas.find(p => p.id === propostaId);
    if (!proposta) return;

    // Atualizar status da proposta
    const propostasStorage = localStorage.getItem('propostas');
    if (propostasStorage) {
      const todasPropostas: Proposta[] = JSON.parse(propostasStorage);
      const index = todasPropostas.findIndex(p => p.id === propostaId);
      if (index !== -1) {
        todasPropostas[index].status = 'ACEITA';
        localStorage.setItem('propostas', JSON.stringify(todasPropostas));
      }
    }

    // Atualizar status da cotação
    this.atualizarStatusCotacao('FECHADA');

    this.snackBar.open(
      `Proposta de ${proposta.fornecedorEmail} aceita com sucesso!`,
      'Fechar',
      { duration: 4000 }
    );

    this.carregarDados();
  }

  recusarProposta(propostaId: string): void {
    const proposta = this.propostas.find(p => p.id === propostaId);
    if (!proposta) return;

    const propostasStorage = localStorage.getItem('propostas');
    if (propostasStorage) {
      const todasPropostas: Proposta[] = JSON.parse(propostasStorage);
      const index = todasPropostas.findIndex(p => p.id === propostaId);
      if (index !== -1) {
        todasPropostas[index].status = 'RECUSADA';
        localStorage.setItem('propostas', JSON.stringify(todasPropostas));
      }
    }

    this.snackBar.open(
      `Proposta de ${proposta.fornecedorEmail} recusada`,
      'Fechar',
      { duration: 3000 }
    );

    this.carregarDados();
  }

  finalizarCotacao(): void {
    if (!this.cotacao) return;

    const propostasAceitas = this.propostas.filter(p => p.status === 'ACEITA');
    if (propostasAceitas.length === 0) {
      this.snackBar.open(
        'Aceite pelo menos uma proposta antes de finalizar',
        'Fechar',
        { duration: 3000 }
      );
      return;
    }

    this.atualizarStatusCotacao('FECHADA');
    this.snackBar.open('Cotação finalizada com sucesso!', 'Fechar', { duration: 3000 });
    this.carregarDados();
  }

  private atualizarStatusCotacao(novoStatus: string): void {
    const cotacoesStorage = localStorage.getItem('cotacoes');
    if (cotacoesStorage && this.cotacao) {
      const cotacoes: Cotacao[] = JSON.parse(cotacoesStorage);
      const index = cotacoes.findIndex(c => c.id === this.cotacao!.id);
      if (index !== -1) {
        cotacoes[index].status = novoStatus;
        localStorage.setItem('cotacoes', JSON.stringify(cotacoes));
      }
    }
  }

  voltar(): void {
    this.router.navigate(['/empresa/dashboard']);
  }

  deletarCotacao(): void {
    if (!this.cotacao) return;

    if (confirm(`Tem certeza que deseja excluir a cotação "${this.cotacao.nome}"?`)) {
      const cotacoesStorage = localStorage.getItem('cotacoes');
      if (cotacoesStorage) {
        let cotacoes: Cotacao[] = JSON.parse(cotacoesStorage);
        cotacoes = cotacoes.filter(c => c.id !== this.cotacao!.id);
        localStorage.setItem('cotacoes', JSON.stringify(cotacoes));
      }

      this.snackBar.open('Cotação excluída com sucesso', 'Fechar', { duration: 3000 });
      this.router.navigate(['/empresa/dashboard']);
    }
  }
}
