import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { CadastrarUsuarioRequest } from '../../models/auth.model';
import { Perfil } from '../../models/perfil.model';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent {
  cadastroForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  perfis = [
    { value: Perfil.FORNECEDOR, label: 'Fornecedor' },
    { value: Perfil.EMPRESA, label: 'Empresa' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.cadastroForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]],
      perfil: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const senha = form.get('senha');
    const confirmarSenha = form.get('confirmarSenha');
    
    if (senha && confirmarSenha && senha.value !== confirmarSenha.value) {
      confirmarSenha.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.cadastroForm.valid) {
      this.isLoading = true;
      const { confirmarSenha, ...userData } = this.cadastroForm.value;
      const request: CadastrarUsuarioRequest = userData;
      
      console.log('📤 Enviando cadastro:', { 
        email: request.email,
        perfil: request.perfil,
        senha: '***'
      });
      
      this.authService.cadastrar(request).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('✅ Cadastro bem-sucedido:', response);
          this.snackBar.open('Cadastro realizado com sucesso! Faça login para continuar.', 'Fechar', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Erro no cadastro:', error);
          
          let errorMessage = 'Erro ao realizar cadastro.';
          
          if (error.status === 409) {
            errorMessage = 'Email já cadastrado no sistema.';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Dados inválidos. Verifique os campos.';
          } else if (error.status === 500) {
            errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
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
    } else {
      this.snackBar.open('Por favor, preencha todos os campos corretamente.', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.cadastroForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo de ${minLength} caracteres`;
    }
    if (field?.hasError('passwordMismatch')) {
      return 'As senhas não conferem';
    }
    return '';
  }
}
