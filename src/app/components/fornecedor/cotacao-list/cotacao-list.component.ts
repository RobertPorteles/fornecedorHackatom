import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { CotacaoService, Cotacao } from '../../../services/cotacao.service';

@Component({
  selector: 'app-cotacao-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './cotacao-list.component.html',
  styleUrls: ['./cotacao-list.component.css']
})
export class CotacaoListComponent implements OnInit {
  cotacoes: Cotacao[] = [];
  isLoading = false;
  error: string = '';

  constructor(
    private cotacaoService: CotacaoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarCotacoes();
  }

  carregarCotacoes(): void {
    this.isLoading = true;
    this.error = '';

    this.cotacaoService.listarCotacoes().subscribe({
      next: (cotacoes) => {
        this.isLoading = false;
        this.cotacoes = cotacoes;
        console.log('✅ Cotações carregadas:', cotacoes.length);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erro ao carregar cotações:', error);
        
        if (error.status === 404) {
          this.error = 'Nenhuma cotação disponível no momento.';
        } else if (error.status === 403) {
          this.error = 'Você precisa completar seu cadastro de fornecedor.';
        } else if (error.status === 0) {
          this.error = 'Não foi possível conectar ao servidor.';
        } else {
          this.error = 'Erro ao carregar cotações. Tente novamente.';
        }
      }
    });
  }

  verDetalhes(cotacaoId: string): void {
    this.router.navigate(['/fornecedor/cotacao', cotacaoId]);
  }
}
