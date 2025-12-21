import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';

import { FornecedorService } from '../../services/fornecedor.service';
import { CadastrarFornecedorRequest } from '../../models/requests.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

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
    MatIconModule
  ],
  templateUrl: './cadastrar-fornecedor.component.html',
  styleUrls: ['./cadastrar-fornecedor.component.css']
})
export class CadastrarFornecedorComponent {
  fornecedorForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private fornecedorService: FornecedorService
  ) {
    this.fornecedorForm = this.fb.group({
      nome: ['', Validators.required],
      cnpj: ['', Validators.required],
      telefone: ['', Validators.required],
      endereco: this.fb.group({
        logradouro: ['', Validators.required],
        numero: ['', Validators.required],
        complemento: [''],
        bairro: ['', Validators.required],
        cidade: ['', Validators.required],
        estado: ['', Validators.required],
        cep: ['', Validators.required]
      }),
      contatos: this.fb.array([])
    });
  }

  get contatos(): FormArray {
    return this.fornecedorForm.get('contatos') as FormArray;
  }

  adicionarContato(): void {
    this.contatos.push(this.fb.control('', Validators.required));
  }

  removerContato(index: number): void {
    this.contatos.removeAt(index);
  }

  onSubmit(): void {
    if (this.fornecedorForm.valid) {
      const request: CadastrarFornecedorRequest = this.fornecedorForm.value;
      
      this.fornecedorService.cadastrarFornecedor(request).subscribe({
        next: (response) => {
          this.successMessage = `Fornecedor cadastrado com sucesso! ID: ${response.id}`;
          this.errorMessage = '';
          this.fornecedorForm.reset();
          this.contatos.clear();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao cadastrar fornecedor. Por favor, tente novamente.';
          this.successMessage = '';
          console.error('Erro:', error);
        }
      });
    }
  }
}
