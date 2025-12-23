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
import { AuthService } from '../../services/auth.service';
import { LoginUsuarioRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
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
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const credentials: LoginUsuarioRequest = this.loginForm.value;
      
      console.log('📤 Enviando login:', { email: credentials.email });
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          setTimeout(() => {
            this.isLoading = false;
            console.log('✅ Login bem-sucedido');
            this.snackBar.open('Login realizado com sucesso!', 'Fechar', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
            
            // Redirecionar baseado no perfil do usuário
            const currentUser = this.authService.getCurrentUser();
            if (currentUser) {
              if (this.authService.isFornecedor()) {
                this.router.navigate(['/fornecedor/dashboard']);
              } else if (this.authService.isEmpresa()) {
                this.router.navigate(['/empresa/dashboard']);
              } else {
                // Fallback caso o perfil não seja reconhecido
                this.router.navigate(['/']);
              }
            } else {
              this.router.navigate(['/']);
            }
          }, 0);
        },
        error: (error) => {
          setTimeout(() => {
            this.isLoading = false;
            console.error('❌ Erro completo:', error);
          
            let errorMessage = 'Erro ao realizar login.';
          
            if (error.status === 500) {
              errorMessage = '⚠️ Erro no servidor (500). Verifique o console do backend para mais detalhes.';
              console.error('🔥 ERRO 500 - Detalhes:', {
                timestamp: error.error?.timestamp,
                error: error.error?.error,
                path: error.error?.path,
                message: error.error?.message
              });
              console.error('💡 VERIFIQUE NO BACKEND:');
              console.error('   1. Usuário existe no banco de dados?');
              console.error('   2. Senha está sendo validada corretamente?');
              console.error('   3. JWT está configurado?');
              console.error('   4. Veja o stack trace no console do Spring Boot');
            } else if (error.status === 401) {
              errorMessage = 'Email ou senha incorretos.';
            } else if (error.status === 404) {
              errorMessage = 'Endpoint não encontrado no servidor.';
            } else if (error.status === 0) {
              errorMessage = 'Não foi possível conectar ao servidor.';
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            }
          
            this.snackBar.open(errorMessage, 'Fechar', {
              duration: 8000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }, 0);
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
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    if (field?.hasError('minlength')) {
      return 'A senha deve ter no mínimo 6 caracteres';
    }
    return '';
  }
}
