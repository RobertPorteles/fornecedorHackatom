import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FornecedorService } from '../../../services/fornecedor.service';

@Component({
  selector: 'app-editar-perfil-empresa',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './editar-perfil-empresa.component.html',
  styleUrls: ['./editar-perfil-empresa.component.css']
})
export class EditarPerfilEmpresaComponent implements OnInit {
  perfilForm: FormGroup;
  isLoading = false;
  isSaving = false;
  empresaId: string = '';

  constructor(
    private fb: FormBuilder,
    private fornecedorService: FornecedorService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.perfilForm = this.fb.group({
      razaoSocial: ['', [Validators.required, Validators.minLength(3)]],
      cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)]],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]]
    });
  }

  ngOnInit(): void {
    this.carregarDadosEmpresa();
  }

  carregarDadosEmpresa(): void {
    this.isLoading = true;
    this.fornecedorService.getEmpresaMe().subscribe({
      next: (empresa) => {
        this.empresaId = empresa.id;
        this.perfilForm.patchValue({
          razaoSocial: empresa.razaoSocial || empresa.nome,
          cnpj: this.formatarCNPJ(empresa.cnpj || ''),
          email: empresa.email || '',
          telefone: this.formatarTelefone(empresa.telefone || ''),
          cep: empresa.endereco?.cep ? this.formatarCEP(empresa.endereco.cep) : '',
          logradouro: empresa.endereco?.logradouro || '',
          numero: empresa.endereco?.numero || '',
          complemento: empresa.endereco?.complemento || '',
          bairro: empresa.endereco?.bairro || '',
          cidade: empresa.endereco?.cidade || '',
          estado: empresa.endereco?.estado || ''
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados da empresa:', error);
        this.snackBar.open('Erro ao carregar dados da empresa', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  formatarCNPJ(cnpj: string): string {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length === 14) {
      return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    return cnpj;
  }

  formatarTelefone(telefone: string): string {
    telefone = telefone.replace(/\D/g, '');
    if (telefone.length === 11) {
      return telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (telefone.length === 10) {
      return telefone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return telefone;
  }

  formatarCEP(cep: string): string {
    cep = cep.replace(/\D/g, '');
    if (cep.length === 8) {
      return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
    }
    return cep;
  }

  onCNPJInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 14) {
      event.target.value = this.formatarCNPJ(value);
      this.perfilForm.get('cnpj')?.setValue(event.target.value, { emitEvent: false });
    }
  }

  onTelefoneInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      event.target.value = this.formatarTelefone(value);
      this.perfilForm.get('telefone')?.setValue(event.target.value, { emitEvent: false });
    }
  }

  onCEPInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      event.target.value = this.formatarCEP(value);
      this.perfilForm.get('cep')?.setValue(event.target.value, { emitEvent: false });
    }
  }

  salvar(): void {
    if (this.perfilForm.invalid) {
      this.snackBar.open('Por favor, preencha todos os campos corretamente', 'Fechar', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const formData = this.perfilForm.value;

    // Remover formatação antes de enviar
    const dados = {
      razaoSocial: formData.razaoSocial,
      cnpj: formData.cnpj.replace(/\D/g, ''),
      email: formData.email,
      telefone: formData.telefone.replace(/\D/g, ''),
      endereco: {
        cep: formData.cep.replace(/\D/g, ''),
        logradouro: formData.logradouro,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado.toUpperCase()
      }
    };

    // TODO: Implementar chamada de API quando backend fornecer endpoint PUT
    // this.fornecedorService.atualizarEmpresa(this.empresaId, dados).subscribe({...})
    
    // Por enquanto, simular sucesso
    setTimeout(() => {
      this.isSaving = false;
      this.snackBar.open('Perfil atualizado com sucesso!', 'Fechar', { duration: 3000 });
      console.log('Dados que seriam enviados:', dados);
    }, 1000);
  }

  cancelar(): void {
    this.router.navigate(['/empresa/dashboard']);
  }
}
