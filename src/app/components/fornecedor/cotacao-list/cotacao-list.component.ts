import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CotacaoService } from '../../../services/cotacao.service';
import { AuthService } from '../../../services/auth.service';
import { SolicitarCotacaoRequest } from '../../../models/cotacao.model';

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
  selector: 'app-cotacao-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './cotacao-list.component.html',
  styleUrls: ['./cotacao-list.component.css']
})
export class CotacaoListComponent implements OnInit {
  cotacoes: Cotacao[] = [];
  isLoading = false;
  error: string = '';
  selectedCotacao: Cotacao | null = null;

  constructor(
    private router: Router,
    private cotacaoService: CotacaoService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.carregarCotacoes();
  }

  carregarCotacoes(): void {
    this.isLoading = true;
    this.error = '';

    try {
      const cotacoesStorage = localStorage.getItem('cotacoes');
      if (cotacoesStorage) {
        let cotacoes = JSON.parse(cotacoesStorage);
        
        // Migrar IDs antigos para UUIDs válidos
        let needsUpdate = false;
        cotacoes = cotacoes.map((cotacao: any) => {
          if (!this.isValidUUID(cotacao.id)) {
            needsUpdate = true;
            return {
              ...cotacao,
              id: this.generateUUID()
            };
          }
          return cotacao;
        });

        // Salvar de volta se houver migração
        if (needsUpdate) {
          localStorage.setItem('cotacoes', JSON.stringify(cotacoes));
          console.log('✅ IDs migrados para UUIDs válidos');
        }

        this.cotacoes = cotacoes;
        console.log('✅ Cotações carregadas do localStorage:', this.cotacoes.length);
      } else {
        this.cotacoes = [];
      }
      this.isLoading = false;
    } catch (error) {
      console.error('❌ Erro ao carregar cotações:', error);
      this.error = 'Erro ao carregar cotações do localStorage.';
      this.isLoading = false;
    }
  }

  verDetalhes(cotacaoId: string): void {
    this.router.navigate(['/fornecedor/cotacao', cotacaoId]);
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

  enviarProposta(cotacao: Cotacao): void {
    this.selectedCotacao = cotacao;
    
    // Pedir texto da proposta
    const texto = prompt(`Enviar proposta para: ${cotacao.nome}\n\nDigite sua proposta:`);
    
    if (!texto || texto.trim().length === 0) {
      this.snackBar.open('Proposta não pode ser vazia', 'Fechar', {
        duration: 3000
      });
      return;
    }

    if (texto.length < 10) {
      this.snackBar.open('Proposta deve ter no mínimo 10 caracteres', 'Fechar', {
        duration: 3000
      });
      return;
    }

    this.isLoading = true;
    const request: SolicitarCotacaoRequest = {
      texto: texto
    };

    // Tentar enviar para a API primeiro
    this.cotacaoService.solicitarParticipacaoCotacao(cotacao.id, request).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.isLoading = false;
        });
        console.log('✅ Proposta enviada para API:', response);
        this.snackBar.open('Proposta enviada com sucesso! Você foi adicionado à cotação.', 'Fechar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        // Se API falhar, salvar localmente
        console.warn('⚠️ API indisponível, salvando proposta localmente:', error);
        this.salvarPropostaLocalStorage(cotacao.id, texto);
        setTimeout(() => {
          this.isLoading = false;
        });
        this.snackBar.open('Proposta salva localmente! (API indisponível)', 'Fechar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['warning-snackbar']
        });
      }
    });
  }

  private salvarPropostaLocalStorage(cotacaoId: string, texto: string): void {
    const propostas = this.getPropostasLocalStorage();
    const cotacao = this.cotacoes.find(c => c.id === cotacaoId);
    const novaProposta = {
      id: this.generateUUID(),
      cotacaoId: cotacaoId,
      cotacaoNome: cotacao?.nome || 'Cotação',
      texto: texto,
      dataEnvio: new Date().toISOString(),
      fornecedorEmail: this.authService.getCurrentUser()?.sub || 'Fornecedor'
    };
    propostas.push(novaProposta);
    localStorage.setItem('propostas', JSON.stringify(propostas));
    console.log('💾 Proposta salva no localStorage:', novaProposta);
    console.log('📧 Email do fornecedor:', novaProposta.fornecedorEmail);
    console.log('📝 Nome da cotação:', novaProposta.cotacaoNome);
  }

  private getPropostasLocalStorage(): any[] {
    const propostas = localStorage.getItem('propostas');
    return propostas ? JSON.parse(propostas) : [];
  }

  private isValidUUID(uuid: string): boolean {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
