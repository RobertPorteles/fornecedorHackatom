import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FornecedorService } from '../../services/fornecedor.service';
import { CadastrarFornecedorRequest } from '../../models/requests.model';
import { CadastroFornecedorResponse } from '../../models/responses.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';

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
export class CadastrarFornecedorComponent implements OnInit {
  fornecedorForm: FormGroup;
  isLoading = false;
  buscandoCep = false;
  fornecedorExistente = false;
  cadastroResponse: CadastroFornecedorResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private fornecedorService: FornecedorService,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.fornecedorForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cnpj: ['', [Validators.required, this.validarCNPJ]],
      telefone: ['', [Validators.required, this.validarTelefone]],
      endereco: this.fb.group({
        logradouro: ['', Validators.required],
        numero: ['', Validators.required],
        complemento: [''],
        bairro: ['', Validators.required],
        cidade: ['', Validators.required],
        estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
        cep: ['', [Validators.required, this.validarCEP]]
      }),
      contatos: this.fb.array([], Validators.required)
    });
    
    // Adicionar pelo menos um contato por padrão
    this.adicionarContato();
  }

  ngOnInit(): void {
    this.carregarDadosExistentes();
  }

  // Validador de CNPJ (14 dígitos)
  validarCNPJ(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const cnpj = control.value.replace(/\D/g, '');
    if (cnpj.length !== 14) {
      return { cnpjInvalido: true };
    }
    return null;
  }

  // Validador de Telefone (formato brasileiro)
  validarTelefone(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const telefone = control.value.replace(/\D/g, '');
    if (telefone.length < 10 || telefone.length > 11) {
      return { telefoneInvalido: true };
    }
    return null;
  }

  // Validador de CEP (8 dígitos)
  validarCEP(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const cep = control.value.replace(/\D/g, '');
    if (cep.length !== 8) {
      return { cepInvalido: true };
    }
    return null;
  }

  // Buscar CEP via ViaCEP
  buscarCep(): void {
    const cepControl = this.fornecedorForm.get('endereco')?.get('cep');
    if (!cepControl || cepControl.invalid) return;

    const cep = cepControl.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    this.buscandoCep = true;
    this.http.get(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
      next: (dados: any) => {
        this.buscandoCep = false;
        if (dados.erro) {
          this.snackBar.open('CEP não encontrado', 'Fechar', { duration: 3000 });
          return;
        }

        // Preencher campos de endereço
        const enderecoGroup = this.fornecedorForm.get('endereco');
        enderecoGroup?.patchValue({
          logradouro: dados.logradouro,
          bairro: dados.bairro,
          cidade: dados.localidade,
          estado: dados.uf,
          complemento: dados.complemento
        });

        this.snackBar.open('Endereço preenchido automaticamente', 'Fechar', { duration: 2000 });
      },
      error: (error) => {
        this.buscandoCep = false;
        console.error('Erro ao buscar CEP:', error);
        this.snackBar.open('Erro ao buscar CEP. Preencha manualmente.', 'Fechar', { duration: 3000 });
      }
    });
  }

  // Carregar dados existentes do fornecedor
  carregarDadosExistentes(): void {
    this.fornecedorService.getFornecedorMe().subscribe({
      next: (response) => {
        console.log('✅ Fornecedor já cadastrado:', response);
        setTimeout(() => {
          this.fornecedorExistente = true;
          this.cadastroResponse = response;
          
          // Popular formulário com dados existentes
          this.fornecedorForm.patchValue({
            nome: response.nome,
            cnpj: response.cnpj,
            telefone: response.telefone,
            endereco: response.endereco
          });

          // Popular contatos
          this.contatos.clear();
          response.contatos.forEach(contato => {
            this.contatos.push(this.fb.control(contato, [Validators.required, Validators.email]));
          });

          this.snackBar.open('Dados do fornecedor carregados com sucesso', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }, 0);
      },
      error: (error) => {
        if (error.status === 404) {
          console.log('ℹ️ Fornecedor ainda não cadastrado');
        } else {
          console.error('❌ Erro ao buscar dados:', error);
        }
      }
    });
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
          setTimeout(() => {
            this.isLoading = false;
            this.cadastroResponse = response;
            this.fornecedorExistente = true;
            
            console.log('✅ Fornecedor cadastrado com sucesso:', response);
            
            this.snackBar.open(
              `Fornecedor cadastrado com sucesso! ID: ${response.id}`,
              'Fechar',
              {
                duration: 5000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['success-snackbar']
              }
            );
            
            // Redirecionar para dashboard após sucesso
            setTimeout(() => {
              this.router.navigate(['/fornecedor/dashboard']);
            }, 2000);
          }, 0);
        },
        error: (error) => {
          console.error('❌ Erro completo:', error);
          console.error('❌ Status:', error.status);
          console.error('❌ Mensagem do backend:', error.error);
          
          setTimeout(() => {
            this.isLoading = false;
            
            let errorMessage = 'Erro ao cadastrar fornecedor.';
          
          if (error.status === 409) {
            errorMessage = 'CNPJ já cadastrado no sistema.';
          } else if (error.status === 400) {
            // Logar detalhes do erro 400
            console.error('🔴 ERRO 400 - Detalhes:', error.error);
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
          }, 0);
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
    if (control?.hasError('cnpjInvalido')) {
      return 'CNPJ deve ter 14 dígitos';
    }
    if (control?.hasError('telefoneInvalido')) {
      return 'Telefone inválido (10-11 dígitos)';
    }
    if (control?.hasError('cepInvalido')) {
      return 'CEP deve ter 8 dígitos';
    }
    return '';
  }
}
