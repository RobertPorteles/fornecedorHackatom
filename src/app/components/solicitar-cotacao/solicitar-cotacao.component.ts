import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CotacaoService } from '../../services/cotacao.service';
import { AuthService } from '../../services/auth.service';
import { StatusCotacao, CadastrarCotacaoRequest } from '../../models/cotacao.model';

@Component({
  selector: 'app-solicitar-cotacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './solicitar-cotacao.component.html',
  styleUrls: ['./solicitar-cotacao.component.css']
})
export class SolicitarCotacaoComponent {
  informacoesForm: FormGroup;
  propostaForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private cotacaoService: CotacaoService,
    private authService: AuthService
  ) {
    this.informacoesForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(5)]],
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      prazoResposta: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0.01)]]
    });

    this.propostaForm = this.fb.group({
      detalhes: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  enviarCotacao(): void {
    if (this.informacoesForm.invalid || this.propostaForm.invalid) {
      this.snackBar.open('Por favor, preencha todos os campos corretamente.', 'Fechar', {
        duration: 3000
      });
      return;
    }

    this.isLoading = true;

    // Obter empresaId do usuário logado (ou gerar UUID temporário)
    const currentUser = this.authService.getCurrentUser();
    const empresaId = currentUser?.id || this.generateUUID();

    console.log('👤 Usuário atual:', currentUser);
    console.log('🏢 Empresa ID:', empresaId);

    // Preparar dados para localStorage (simulação)
    const cotacaoDataLocal = {
      id: this.generateUUID(), // Usar UUID em vez de ID simples
      status: StatusCotacao.ABERTA,
      dataCreated: new Date().toISOString(),
      empresaId: empresaId,
      ...this.informacoesForm.value,
      ...this.propostaForm.value
    };

    // Preparar request para o backend
    const request: CadastrarCotacaoRequest = {
      nome: this.informacoesForm.value.nome,
      descricao: this.informacoesForm.value.descricao,
      data: this.cotacaoService.formatarDataParaBackend(this.informacoesForm.value.prazoResposta),
      empresaId: empresaId,
      status: StatusCotacao.ABERTA
    };

    console.log('📤 Criando cotação:', request);

    // Salvar no localStorage primeiro
    this.salvarCotacaoLocalStorage(cotacaoDataLocal);
    console.log('💾 Cotação salva no localStorage');

    // Tentar enviar para o backend
    this.cotacaoService.criarCotacao(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('✅ Cotação criada no backend:', response);
        this.snackBar.open('Cotação criada com sucesso!', 'Fechar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/empresa/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        console.warn('⚠️ Backend indisponível, cotação salva localmente:', error);
        this.snackBar.open('Cotação salva localmente! (Backend indisponível)', 'Fechar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['warning-snackbar']
        });
        this.router.navigate(['/empresa/dashboard']);
      }
    });
  }

  private salvarCotacaoLocalStorage(cotacao: any): void {
    const cotacoes = this.getCotacoesLocalStorage();
    cotacoes.push(cotacao);
    localStorage.setItem('cotacoes', JSON.stringify(cotacoes));
  }

  private getCotacoesLocalStorage(): any[] {
    const cotacoes = localStorage.getItem('cotacoes');
    return cotacoes ? JSON.parse(cotacoes) : [];
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  getErrorMessage(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo de ${minLength} caracteres`;
    }
    if (field?.hasError('min')) {
      return 'O valor deve ser maior que zero';
    }
    return '';
  }
}
