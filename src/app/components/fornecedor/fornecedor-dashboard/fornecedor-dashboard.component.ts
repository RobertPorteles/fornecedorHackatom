import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FornecedorService } from '../../../services/fornecedor.service';
import { JwtPayload } from '../../../models/perfil.model';

@Component({
  selector: 'app-fornecedor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink
  ],
  templateUrl: './fornecedor-dashboard.component.html',
  styleUrls: ['./fornecedor-dashboard.component.css']
})
export class FornecedorDashboardComponent implements OnInit {
  currentUser: JwtPayload | null = null;
  fornecedorNome: string = '';
  fornecedorCnpj: string = '';

  constructor(
    public authService: AuthService,
    private fornecedorService: FornecedorService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('👤 Usuário Fornecedor:', this.currentUser);
    this.carregarDadosFornecedor();
  }

  carregarDadosFornecedor(): void {
    this.fornecedorService.getFornecedorMe().subscribe({
      next: (fornecedor) => {
        this.fornecedorNome = fornecedor.nome || 'Fornecedor';
        this.fornecedorCnpj = fornecedor.cnpj || '';
        console.log('🏪 Fornecedor carregado:', this.fornecedorNome);
      },
      error: (error) => {
        console.error('Erro ao carregar dados do fornecedor:', error);
        this.fornecedorNome = this.currentUser?.sub || 'Fornecedor';
      }
    });
  }
}
