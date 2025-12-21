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
    private snackBar: MatSnackBar
  ) {
    this.informacoesForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(5)]],
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      prazoResposta: ['', Validators.required]
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

    const cotacaoData = {
      ...this.informacoesForm.value,
      ...this.propostaForm.value
    };

    console.log('📤 Criando cotação:', cotacaoData);

    // TODO: Chamar serviço real quando backend estiver pronto
    // this.cotacaoService.criarCotacao(cotacaoData).subscribe(...)
    
    // Simulação
    setTimeout(() => {
      this.isLoading = false;
      this.snackBar.open('Cotação criada com sucesso!', 'Fechar', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
      this.router.navigate(['/empresa/dashboard']);
    }, 1500);
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
    return '';
  }
}
