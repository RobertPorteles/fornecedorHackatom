import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FornecedorService } from '../../services/fornecedor.service';
import { CadastrarFornecedorRequest } from '../../models/requests.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-cadastrar-fornecedor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './cadastrar-fornecedor.component.html',
  styleUrls: ['./cadastrar-fornecedor.component.css']
})
export class CadastrarFornecedorComponent {
  fornecedorForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private fornecedorService: FornecedorService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.fornecedorForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cnpj: ['', [Validators.required]],
      telefone: ['', [Validators.required]],
      endereco: this.fb.group({
        logradouro: ['', Validators.required],
        numero: ['', Validators.required],
        complemento: [''],
        bairro: ['', Validators.required],
        cidade: ['', Validators.required],
        estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
        cep: ['', [Validators.required]]
      }),
      contatos: this.fb.array([], Validators.required)
    });
    
    // Adicionar pelo menos um contato por padrão
    this.adicionarContato();
  }

  get contatos(): FormArray {
    return this.fornecedorForm.get('contatos') as FormArray;
  }

  adicionarContato(): void {
    this.contatos.push(this.fb.control('', [Validators.required, Validators.email]));
  }

  removerContato(index: number): void {
    if (this.contatos.length > 1) {
      this.contatos.removeAt(index);
    } else {
      this.snackBar.open('Pelo menos um contato é obrigatório.', 'Fechar', {
        duration: 3000
      });
    }
  }

  onSubmit(): void {
    if (this.fornecedorForm.valid) {
      this.isLoading = true;
      const request: CadastrarFornecedorRequest = this.fornecedorForm.value;
      
      console.log('📤 Enviando cadastro de fornecedor para http://localhost:8081/api/v1/fornecedor');
      console.log('📦 Request:', {
        nome: request.nome,
        cnpj: request.cnpj,
        telefone: request.telefone,
        contatos: request.contatos,
        endereco: request.endereco
      });
      
      this.fornecedorService.cadastrarFornecedor(request).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('✅ Fornecedor cadastrado com sucesso:', response);
          this.snackBar.open(`Fornecedor "${response.nome}" cadastrado com sucesso!`, 'Fechar', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.fornecedorForm.reset();
          this.contatos.clear();
          this.adicionarContato();
          
          // Redirecionar para dashboard após sucesso
          setTimeout(() => {
            this.router.navigate(['/fornecedor/dashboard']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Erro completo:', error);
          
          let errorMessage = 'Erro ao cadastrar fornecedor.';
          
          if (error.status === 409) {
            errorMessage = 'CNPJ já cadastrado no sistema.';
          } else if (error.status === 400) {
            if (error.error?.message?.includes('já possui')) {
              errorMessage = 'Você já possui um fornecedor cadastrado.';
            } else {
              errorMessage = error.error?.message || 'Dados inválidos. Verifique os campos.';
            }
          } else if (error.status === 401) {
            errorMessage = 'Você precisa estar autenticado.';
          } else if (error.status === 403) {
            errorMessage = 'Apenas usuários com perfil FORNECEDOR podem cadastrar.';
          } else if (error.status === 500) {
            errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
            console.error('🔥 ERRO 500 - Detalhes:', {
              timestamp: error.error?.timestamp,
              error: error.error?.error,
              path: error.error?.path,
              message: error.error?.message
            });
          } else if (error.status === 0) {
            errorMessage = 'Não foi possível conectar ao servidor na porta 8081.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.snackBar.open(errorMessage, 'Fechar', {
            duration: 8000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios corretamente.', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      
      // Marcar todos os campos como touched para mostrar erros
      Object.keys(this.fornecedorForm.controls).forEach(key => {
        this.fornecedorForm.get(key)?.markAsTouched();
      });
      const enderecoGroup = this.fornecedorForm.get('endereco') as FormGroup;
      if (enderecoGroup) {
        Object.keys(enderecoGroup.controls).forEach(key => {
          enderecoGroup.get(key)?.markAsTouched();
        });
      }
    }
  }

  getErrorMessage(controlName: string, groupName?: string): string {
    const control = groupName 
      ? this.fornecedorForm.get(groupName)?.get(controlName)
      : this.fornecedorForm.get(controlName);
    
    if (control?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    if (control?.hasError('email')) {
      return 'Email inválido';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo de ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('maxlength')) {
      return `Máximo de ${control.errors?.['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }
}
