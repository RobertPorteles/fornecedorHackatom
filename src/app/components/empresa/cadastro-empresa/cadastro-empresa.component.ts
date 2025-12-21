import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FornecedorService } from '../../../services/fornecedor.service';

@Component({
  selector: 'app-cadastro-empresa',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './cadastro-empresa.component.html',
  styleUrls: ['./cadastro-empresa.component.css']
})
export class CadastroEmpresaComponent {
  empresaForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private fornecedorService: FornecedorService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.empresaForm = this.fb.group({
      razaoSocial: ['', [Validators.required, Validators.minLength(3)]],
      cnpj: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required]],
      endereco: this.fb.group({
        logradouro: ['', Validators.required],
        numero: ['', Validators.required],
        complemento: [''],
        bairro: ['', Validators.required],
        cidade: ['', Validators.required],
        estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
        cep: ['', [Validators.required]]
      })
    });
  }

  onSubmit(): void {
    if (this.empresaForm.valid) {
      this.isLoading = true;
      const request = this.empresaForm.value;
      
      console.log('📤 Enviando cadastro de empresa para http://localhost:8081/api/v1/empresa/cadastrar');
      console.log('📦 Request:', request);
      
      // TODO: Criar método cadastrarEmpresa no fornecedorService
      // Por enquanto, simular sucesso
      setTimeout(() => {
        this.isLoading = false;
        this.snackBar.open('Empresa cadastrada com sucesso!', 'Fechar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/empresa/dashboard']);
      }, 1000);
    } else {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios corretamente.', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      
      Object.keys(this.empresaForm.controls).forEach(key => {
        this.empresaForm.get(key)?.markAsTouched();
      });
      const enderecoGroup = this.empresaForm.get('endereco') as FormGroup;
      if (enderecoGroup) {
        Object.keys(enderecoGroup.controls).forEach(key => {
          enderecoGroup.get(key)?.markAsTouched();
        });
      }
    }
  }

  getErrorMessage(controlName: string, groupName?: string): string {
    const control = groupName 
      ? this.empresaForm.get(groupName)?.get(controlName)
      : this.empresaForm.get(controlName);
    
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
