import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FornecedorService } from '../../../services/fornecedor.service';

export interface FornecedorResumo {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  cidade: string;
  estado: string;
}

export interface FornecedorCompleto {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  contatos: string[];
  usuarioId?: string;
}

@Component({
  selector: 'app-lista-fornecedores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './lista-fornecedores.component.html',
  styleUrls: ['./lista-fornecedores.component.css']
})
export class ListaFornecedoresComponent implements OnInit {
  fornecedores: FornecedorResumo[] = [];
  fornecedoresFiltrados: FornecedorResumo[] = [];
  fornecedoresCompletos: FornecedorCompleto[] = [];
  primeiroFornecedor: FornecedorCompleto | null = null;
  isLoading = false;
  filtro = '';
  displayedColumns: string[] = ['nome', 'cnpj', 'telefone', 'localizacao', 'acoes'];

  constructor(
    private fornecedorService: FornecedorService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.carregarFornecedores();
  }

  carregarFornecedores(): void {
    this.isLoading = true;
    this.fornecedorService.listarFornecedores().subscribe({
      next: (response: any) => {
        setTimeout(() => {
          this.isLoading = false;
          console.log('✅ Fornecedores carregados:', response);
          
          // Mapear resposta para FornecedorResumo
          if (Array.isArray(response)) {
            this.fornecedoresCompletos = response;
            this.fornecedores = response.map(f => ({
              id: f.id,
              nome: f.nome,
              cnpj: f.cnpj,
              telefone: f.telefone,
              cidade: f.endereco?.cidade || 'N/A',
              estado: f.endereco?.estado || 'N/A'
            }));
          } else if (response.fornecedores) {
            this.fornecedoresCompletos = response.fornecedores;
            this.fornecedores = response.fornecedores.map((f: any) => ({
              id: f.id,
              nome: f.nome,
              cnpj: f.cnpj,
              telefone: f.telefone,
              cidade: f.cidade || f.endereco?.cidade || 'N/A',
              estado: f.estado || f.endereco?.estado || 'N/A'
            }));
          }
          
          this.fornecedoresFiltrados = [...this.fornecedores];
          
          // Selecionar o primeiro fornecedor ou null
          this.primeiroFornecedor = this.fornecedoresCompletos.length > 0 
            ? this.fornecedoresCompletos[0] 
            : null;
          
          console.log('📋 Primeiro fornecedor:', this.primeiroFornecedor);
          
          if (this.fornecedores.length === 0) {
            this.snackBar.open('Nenhum fornecedor cadastrado', 'Fechar', {
              duration: 3000
            });
          }
        }, 0);
      },
      error: (error) => {
        setTimeout(() => {
          this.isLoading = false;
          console.error('❌ Erro ao carregar fornecedores:', error);
        
        let errorMessage = 'Erro ao carregar fornecedores.';
        
        if (error.status === 401) {
          errorMessage = 'Sessão expirada. Faça login novamente.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else if (error.status === 403) {
          errorMessage = 'Você não tem permissão para visualizar fornecedores.';
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
        }, 0);
      }
    });
  }

  aplicarFiltro(): void {
    const filtroLower = this.filtro.toLowerCase().trim();
    
    if (!filtroLower) {
      this.fornecedoresFiltrados = [...this.fornecedores];
      return;
    }

    this.fornecedoresFiltrados = this.fornecedores.filter(f =>
      f.nome.toLowerCase().includes(filtroLower) ||
      f.cnpj.toLowerCase().includes(filtroLower) ||
      f.telefone.toLowerCase().includes(filtroLower) ||
      f.cidade.toLowerCase().includes(filtroLower) ||
      f.estado.toLowerCase().includes(filtroLower)
    );
  }

  limparFiltro(): void {
    this.filtro = '';
    this.aplicarFiltro();
  }

  verDetalhes(fornecedor: FornecedorResumo): void {
    console.log('Ver detalhes do fornecedor:', fornecedor);
    this.snackBar.open(`Detalhes de ${fornecedor.nome}`, 'Fechar', {
      duration: 2000
    });
    // TODO: Navegar para página de detalhes ou abrir modal
  }

  editar(fornecedor: FornecedorResumo): void {
    console.log('Editar fornecedor:', fornecedor);
    this.snackBar.open('Funcionalidade de edição em desenvolvimento', 'Fechar', {
      duration: 2000
    });
    // TODO: Implementar edição de fornecedor
  }

  formatarCNPJ(cnpj: string): string {
    if (!cnpj) return '';
    const numeros = cnpj.replace(/\D/g, '');
    if (numeros.length === 14) {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpj;
  }

  formatarTelefone(telefone: string): string {
    if (!telefone) return '';
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
      return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numeros.length === 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  }
}
