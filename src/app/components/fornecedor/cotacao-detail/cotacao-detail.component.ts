import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { CotacaoService, Cotacao } from '../../../services/cotacao.service';
import { PropostaService } from '../../../services/proposta.service';
import { FornecedorService } from '../../../services/fornecedor.service';
import { AuthService } from '../../../services/auth.service';
import { forkJoin, catchError, of } from 'rxjs';

type StatusParticipacao = 'nao-participando' | 'participando' | 'em-negociacao';

@Component({
  selector: 'app-cotacao-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './cotacao-detail.component.html',
  styleUrls: ['./cotacao-detail.component.css']
})
export class CotacaoDetailComponent implements OnInit {
  cotacao: Cotacao | null = null;
  cotacaoId: string = '';
  isLoading = false;
  isSending = false;
  error: string = '';
  
  fornecedorId: string = '';
  statusParticipacao: StatusParticipacao = 'nao-participando';
  
  propostaForm: FormGroup;
  negociacaoForm: FormGroup;
  
  historico: any[] = [];
  showHistorico = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cotacaoService: CotacaoService,
    private propostaService: PropostaService,
    private fornecedorService: FornecedorService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.propostaForm = this.fb.group({
      texto: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.negociacaoForm = this.fb.group({
      texto: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

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
    this.error = '';

    // Tentar carregar da API primeiro, se falhar usar localStorage
    this.cotacaoService.getCotacaoById(this.cotacaoId).subscribe({
      next: (cotacao) => {
        this.isLoading = false;
        this.cotacao = cotacao;
        console.log('✅ Cotação carregada da API:', cotacao);
        this.carregarDadosFornecedor();
      },
      error: (error) => {
        console.warn('⚠️ API indisponível, tentando localStorage:', error);
        this.carregarCotacaoLocalStorage();
      }
    });
  }

  carregarCotacaoLocalStorage(): void {
    try {
      const cotacoesStorage = localStorage.getItem('cotacoes');
      if (cotacoesStorage) {
        const cotacoes = JSON.parse(cotacoesStorage);
        const cotacaoEncontrada = cotacoes.find((c: any) => c.id === this.cotacaoId);
        
        if (cotacaoEncontrada) {
          this.cotacao = cotacaoEncontrada;
          this.isLoading = false;
          console.log('✅ Cotação carregada do localStorage:', cotacaoEncontrada);
          this.carregarDadosFornecedor();
        } else {
          this.isLoading = false;
          this.error = 'Cotação não encontrada';
        }
      } else {
        this.isLoading = false;
        this.error = 'Nenhuma cotação disponível';
      }
    } catch (error) {
      console.error('❌ Erro ao carregar do localStorage:', error);
      this.isLoading = false;
      this.error = 'Erro ao carregar cotação';
    }
  }

  carregarDadosFornecedor(): void {
    this.fornecedorService.getFornecedorMe().subscribe({
      next: (fornecedor) => {
        if (fornecedor?.id) {
          this.fornecedorId = fornecedor.id;
          this.verificarParticipacao();
        }
      },
      error: (error) => {
        console.warn('⚠️ Fornecedor não cadastrado ou API indisponível');
        // Continuar mesmo sem dados do fornecedor
      }
    });
  }

  verificarParticipacao(): void {
    if (!this.cotacao || !this.fornecedorId) {
      this.statusParticipacao = 'nao-participando';
      return;
    }

    // Apenas verificar localStorage
    this.verificarParticipacaoLocalStorage();
  }

  verificarParticipacaoLocalStorage(): void {
    const propostas = localStorage.getItem('propostas');
    if (propostas) {
      const todasPropostas = JSON.parse(propostas);
      const minhasPropostas = todasPropostas.filter((p: any) => p.cotacaoId === this.cotacaoId);
      if (minhasPropostas.length > 0) {
        this.statusParticipacao = 'participando';
        this.historico = minhasPropostas;
      } else {
        this.statusParticipacao = 'nao-participando';
      }
    } else {
      this.statusParticipacao = 'nao-participando';
    }
  }

  carregarHistorico(): void {
    this.propostaService.getHistorico(this.cotacaoId).subscribe({
      next: (historico) => {
        this.historico = historico;
        this.showHistorico = historico.length > 0;
        console.log('✅ Histórico carregado:', historico);
      },
      error: (error) => {
        console.warn('⚠️ Erro ao carregar histórico:', error);
        // Não exibir erro para o usuário, apenas não mostrar histórico
      }
    });
  }

  enviarProposta(): void {
    if (this.propostaForm.invalid) {
      this.snackBar.open('Por favor, preencha o texto da proposta.', 'Fechar', {
        duration: 3000
      });
      return;
    }

    this.isSending = true;
    const texto = this.propostaForm.value.texto;

    // Tentar enviar para API primeiro
    this.propostaService.solicitarCotacao(this.cotacaoId, texto).subscribe({
      next: (response) => {
        this.isSending = false;
        console.log('✅ Proposta enviada para API:', response);
        
        // Salvar também no localStorage
        this.salvarPropostaLocalStorage(texto);
        
        this.snackBar.open('Proposta enviada com sucesso!', 'Fechar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });

        // Atualizar status e desabilitar formulário de proposta
        this.statusParticipacao = 'participando';
        this.propostaForm.disable();
        
        // Recarregar dados para atualizar status
        this.carregarDados();
      },
      error: (error) => {
        // Se API falhar, salvar apenas localmente
        console.warn('⚠️ API indisponível, salvando proposta localmente:', error);
        this.salvarPropostaLocalStorage(texto);
        this.isSending = false;
        
        this.snackBar.open('Proposta salva localmente! (API indisponível)', 'Fechar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['warning-snackbar']
        });

        // Atualizar status
        this.statusParticipacao = 'participando';
        this.propostaForm.disable();
      }
    });
  }

  private salvarPropostaLocalStorage(texto: string): void {
    const propostas = this.getPropostasLocalStorage();
    const novaProposta = {
      id: this.generateUUID(),
      cotacaoId: this.cotacaoId,
      cotacaoNome: this.cotacao?.nome || 'Cotação',
      texto: texto,
      dataEnvio: new Date().toISOString(),
      fornecedorEmail: this.authService.getCurrentUser()?.sub || 'Fornecedor'
    };
    propostas.push(novaProposta);
    localStorage.setItem('propostas', JSON.stringify(propostas));
    console.log('💾 Proposta salva no localStorage:', novaProposta);
    console.log('📧 Email do fornecedor:', novaProposta.fornecedorEmail);
    console.log('📝 Total de propostas:', propostas.length);
  }

  private getPropostasLocalStorage(): any[] {
    const propostas = localStorage.getItem('propostas');
    return propostas ? JSON.parse(propostas) : [];
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  enviarNegociacao(): void {
    if (this.negociacaoForm.invalid) {
      this.snackBar.open('Por favor, preencha o texto da negociação.', 'Fechar', {
        duration: 3000
      });
      return;
    }

    this.isSending = true;
    const texto = this.negociacaoForm.value.texto;

    this.propostaService.negociarCotacao(this.cotacaoId, texto).subscribe({
      next: (response) => {
        this.isSending = false;
        console.log('✅ Negociação enviada:', response);
        
        this.snackBar.open('Negociação enviada com sucesso!', 'Fechar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });

        // Limpar formulário e recarregar histórico
        this.negociacaoForm.reset();
        this.carregarHistorico();
      },
      error: (error) => {
        this.isSending = false;
        console.error('❌ Erro ao enviar negociação:', error);
        
        let errorMessage = 'Erro ao enviar negociação.';
        
        if (error.status === 404) {
          errorMessage = 'Cotação não encontrada.';
        } else if (error.status === 403) {
          errorMessage = 'Você não está autorizado a negociar esta cotação.';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Dados inválidos.';
        } else if (error.status === 0) {
          errorMessage = 'Não foi possível conectar ao servidor.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.snackBar.open(errorMessage, 'Fechar', {
          duration: 6000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/fornecedor/cotacoes']);
  }

  getStatusColor(): 'primary' | 'accent' | 'warn' {
    switch (this.statusParticipacao) {
      case 'nao-participando':
        return 'warn';
      case 'participando':
        return 'accent';
      case 'em-negociacao':
        return 'primary';
      default:
        return 'warn';
    }
  }

  getStatusLabel(): string {
    switch (this.statusParticipacao) {
      case 'nao-participando':
        return 'Não Participando';
      case 'participando':
        return 'Participando';
      case 'em-negociacao':
        return 'Em Negociação';
      default:
        return 'Status Desconhecido';
    }
  }
}
