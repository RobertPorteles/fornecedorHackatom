import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cotacao-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './cotacao-input.component.html',
  styleUrls: ['./cotacao-input.component.css']
})
export class CotacaoInputComponent {
  cotacaoForm: FormGroup;

  // Regex para UUID v4
  private uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.cotacaoForm = this.fb.group({
      uuid: ['', [
        Validators.required,
        Validators.pattern(this.uuidPattern)
      ]]
    });
  }

  buscarCotacao(): void {
    if (this.cotacaoForm.invalid) {
      this.snackBar.open('Por favor, insira um UUID válido', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const uuid = this.cotacaoForm.value.uuid.trim();
    this.router.navigate(['/fornecedor/cotacao', uuid]);
  }

  colarUUID(): void {
    navigator.clipboard.readText().then(text => {
      this.cotacaoForm.patchValue({ uuid: text.trim() });
      
      if (this.cotacaoForm.get('uuid')?.valid) {
        this.snackBar.open('UUID colado com sucesso!', 'Fechar', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      } else {
        this.snackBar.open('UUID inválido na área de transferência', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    }).catch(err => {
      this.snackBar.open('Erro ao acessar área de transferência', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      console.error('Erro ao colar:', err);
    });
  }

  getErrorMessage(): string {
    const uuidControl = this.cotacaoForm.get('uuid');
    if (uuidControl?.hasError('required')) {
      return 'UUID é obrigatório';
    }
    if (uuidControl?.hasError('pattern')) {
      return 'Formato de UUID inválido (ex: 550e8400-e29b-41d4-a716-446655440000)';
    }
    return '';
  }
}
