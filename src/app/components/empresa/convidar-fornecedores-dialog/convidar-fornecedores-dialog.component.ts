import { Component, Inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FornecedorService } from '../../../services/fornecedor.service';
import { CotacaoService } from '../../../services/cotacao.service';

export interface DialogData {
  cotacaoId: string;
  cotacaoNome: string;
}

interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  cidade: string;
  estado: string;
}

@Component({
  selector: 'app-convidar-fornecedores-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './convidar-fornecedores-dialog.component.html',
  styleUrls: ['./convidar-fornecedores-dialog.component.css']
})
export class ConvidarFornecedoresDialogComponent implements OnInit {
  @ViewChild('fornecedoresList') fornecedoresList!: MatSelectionList;
  
  fornecedores: Fornecedor[] = [];
  fornecedoresJaConvidados: string[] = [];
  isLoading = true;
  enviandoConvites = false;

  constructor(
    public dialogRef: MatDialogRef<ConvidarFornecedoresDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fornecedorService: FornecedorService,
    private cotacaoService: CotacaoService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarFornecedoresJaConvidados();
    this.carregarFornecedores();
  }

  carregarFornecedoresJaConvidados(): void {
    this.fornecedoresJaConvidados = this.cotacaoService.listarFornecedoresConvidados(this.data.cotacaoId);
    console.log('📋 Fornecedores já convidados:', this.fornecedoresJaConvidados);
  }

  carregarFornecedores(): void {
    this.fornecedorService.listarFornecedores().subscribe({
      next: (response) => {
        console.log('📥 Resposta do serviço de fornecedores:', response);
        
        // A resposta pode ser um array direto ou um objeto com propriedade 'fornecedores'
        let fornecedoresArray = Array.isArray(response) ? response : response.fornecedores || [];
        
        // Mapear para o formato esperado
        this.fornecedores = fornecedoresArray.map((f: any) => ({
          id: f.id,
          nome: f.nome,
          cnpj: f.cnpj,
          telefone: f.telefone,
          cidade: f.endereco?.cidade || f.cidade || '',
          estado: f.endereco?.estado || f.estado || ''
        }));
        
        console.log('✅ Fornecedores carregados:', this.fornecedores.length);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erro ao carregar fornecedores:', error);
        
        this.isLoading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Erro ao carregar fornecedores', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  jaFoiConvidado(fornecedorId: string): boolean {
    return this.fornecedoresJaConvidados.includes(fornecedorId);
  }

  getNumeroSelecionados(): number {
    return this.fornecedoresList?.selectedOptions?.selected?.length || 0;
  }

  convidar(): void {
    if (!this.fornecedoresList || this.getNumeroSelecionados() === 0) {
      this.snackBar.open('Selecione ao menos um fornecedor', 'Fechar', {
        duration: 2000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    const selectedIds = this.fornecedoresList.selectedOptions.selected
      .map(option => option.value);
    
    console.log('📧 Enviando convites para:', selectedIds);
    
    this.enviandoConvites = true;
    this.cotacaoService.convidarFornecedores(this.data.cotacaoId, selectedIds)
      .subscribe({
        next: (response) => {
          console.log('✅ Resposta do convite:', response);
          this.snackBar.open(
            response.mensagem || `${selectedIds.length} fornecedor(es) convidado(s) com sucesso!`,
            'Fechar',
            { 
              duration: 4000,
              panelClass: ['success-snackbar']
            }
          );
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('❌ Erro ao convidar fornecedores:', error);
          this.enviandoConvites = false;
          this.snackBar.open(
            error.message || 'Erro ao convidar fornecedores',
            'Fechar',
            { 
              duration: 3000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
