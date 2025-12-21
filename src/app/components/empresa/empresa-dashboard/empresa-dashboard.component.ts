import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { JwtPayload } from '../../../models/perfil.model';

interface Cotacao {
  id: string;
  nome: string;
  descricao: string;
  detalhes: string;
  prazoResposta: string;
  status: string;
  dataCreated: string;
}

@Component({
  selector: 'app-empresa-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    RouterLink
  ],
  templateUrl: './empresa-dashboard.component.html',
  styleUrls: ['./empresa-dashboard.component.css']
})
export class EmpresaDashboardComponent implements OnInit {
  currentUser: JwtPayload | null = null;
  cotacoes: Cotacao[] = [];

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('👤 Usuário Empresa:', this.currentUser);
    this.carregarCotacoes();
  }

  carregarCotacoes(): void {
    const cotacoesStorage = localStorage.getItem('cotacoes');
    if (cotacoesStorage) {
      this.cotacoes = JSON.parse(cotacoesStorage);
    }
  }

  deletarCotacao(id: string): void {
    this.cotacoes = this.cotacoes.filter(c => c.id !== id);
    localStorage.setItem('cotacoes', JSON.stringify(this.cotacoes));
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
