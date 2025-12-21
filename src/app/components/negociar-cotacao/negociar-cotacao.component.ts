import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FornecedorService } from '../../services/fornecedor.service';
import { NegociarCotacaoRequest } from '../../models/requests.model';

@Component({
  selector: 'app-negociar-cotacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './negociar-cotacao.component.html',
  styleUrls: ['./negociar-cotacao.component.css']
})
export class NegociarCotacaoComponent implements OnInit {
  negociacaoForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  cotacaoId: string = '';

  constructor(
    private fb: FormBuilder,
    private fornecedorService: FornecedorService,
    private route: ActivatedRoute
  ) {
    this.negociacaoForm = this.fb.group({
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
        this.negociacaoForm.patchValue({ cotacaoId: id });
      }
    });
  }

  onSubmit(): void {
    if (this.negociacaoForm.valid) {
      const cotacaoId = this.negociacaoForm.value.cotacaoId;
      const request: NegociarCotacaoRequest = {
        mensagem: this.negociacaoForm.value.mensagem
      };
      
      this.fornecedorService.negociarCotacao(cotacaoId, request).subscribe({
        next: (response) => {
          this.successMessage = response.mensagem || 'Negociação enviada com sucesso!';
          this.errorMessage = '';
          this.negociacaoForm.patchValue({ mensagem: '' });
        },
        error: (error) => {
          this.errorMessage = 'Erro ao negociar cotação. Por favor, tente novamente.';
          this.successMessage = '';
          console.error('Erro:', error);
        }
      });
    }
  }
}
