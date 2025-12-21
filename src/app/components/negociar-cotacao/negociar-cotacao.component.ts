import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FornecedorService } from '../../services/fornecedor.service';
import { NegociarCotacaoRequest } from '../../models/requests.model';

interface ChatMessage {
  texto: string;
  timestamp: Date;
  tipo: 'enviada' | 'recebida';
}

@Component({
  selector: 'app-negociar-cotacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './negociar-cotacao.component.html',
  styleUrls: ['./negociar-cotacao.component.css']
})
export class NegociarCotacaoComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  
  negociacaoForm: FormGroup;
  cotacaoId: string = '';
  mensagens: ChatMessage[] = [];
  isLoading = false;
  private shouldScroll = false;

  constructor(
    private fb: FormBuilder,
    private fornecedorService: FornecedorService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.negociacaoForm = this.fb.group({
      mensagem: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.cotacaoId = id;
        this.loadHistorico();
      } else {
        this.snackBar.open('ID da cotação não fornecido', 'Fechar', { duration: 3000 });
        this.router.navigate(['/fornecedor/dashboard']);
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  loadHistorico(): void {
    const key = `cotacao_history_${this.cotacaoId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        this.mensagens = JSON.parse(stored).map((msg: ChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        this.shouldScroll = true;
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }
    }
  }

  saveHistorico(): void {
    const key = `cotacao_history_${this.cotacaoId}`;
    localStorage.setItem(key, JSON.stringify(this.mensagens));
  }

  enviarMensagem(): void {
    if (this.negociacaoForm.invalid) {
      this.snackBar.open('Mensagem deve ter no mínimo 10 caracteres', 'Fechar', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const texto = this.negociacaoForm.value.mensagem;
    
    const request: NegociarCotacaoRequest = { mensagem: texto };

    this.fornecedorService.negociarCotacao(this.cotacaoId, request).subscribe({
      next: (response) => {
        // Adiciona mensagem enviada
        this.mensagens.push({
          texto: texto,
          timestamp: new Date(),
          tipo: 'enviada'
        });

        // Simula resposta (em produção viria do backend)
        if (response.mensagem) {
          this.mensagens.push({
            texto: response.mensagem,
            timestamp: new Date(),
            tipo: 'recebida'
          });
        }

        this.saveHistorico();
        this.negociacaoForm.reset();
        this.shouldScroll = true;
        this.isLoading = false;

        this.snackBar.open('Mensagem enviada!', 'Fechar', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        this.isLoading = false;
        let errorMsg = 'Erro ao enviar mensagem. Tente novamente.';
        
        if (error.status === 404) {
          errorMsg = 'Cotação não encontrada.';
        } else if (error.status === 403) {
          errorMsg = 'Você não tem permissão para negociar esta cotação.';
        } else if (error.status === 401) {
          errorMsg = 'Fornecedor não encontrado. Faça login novamente.';
        }

        this.snackBar.open(errorMsg, 'Fechar', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (error) {
      console.error('Erro ao rolar para o final:', error);
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
