import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FornecedorService } from '../../services/fornecedor.service';
import { SolicitarCotacaoRequest } from '../../models/requests.model';

@Component({
  selector: 'app-solicitar-cotacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './solicitar-cotacao.component.html',
  styleUrls: ['./solicitar-cotacao.component.css']
})
export class SolicitarCotacaoComponent implements OnInit {
  solicitacaoForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  cotacaoId: string = '';

  constructor(
    private fb: FormBuilder,
    private fornecedorService: FornecedorService,
    private route: ActivatedRoute
  ) {
    this.solicitacaoForm = this.fb.group({
      cotacaoId: ['', Validators.required],
      mensagem: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Try to get cotacaoId from route params
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.cotacaoId = id;
        this.solicitacaoForm.patchValue({ cotacaoId: id });
      }
    });
  }

  onSubmit(): void {
    if (this.solicitacaoForm.valid) {
      const cotacaoId = this.solicitacaoForm.value.cotacaoId;
      const request: SolicitarCotacaoRequest = {
        mensagem: this.solicitacaoForm.value.mensagem
      };
      
      this.fornecedorService.solicitarCotacao(cotacaoId, request).subscribe({
        next: (response) => {
          this.successMessage = response.mensagem || 'Cotação solicitada com sucesso!';
          this.errorMessage = '';
          this.solicitacaoForm.patchValue({ mensagem: '' });
        },
        error: (error) => {
          this.errorMessage = 'Erro ao solicitar cotação. Por favor, tente novamente.';
          this.successMessage = '';
          console.error('Erro:', error);
        }
      });
    }
  }
}
