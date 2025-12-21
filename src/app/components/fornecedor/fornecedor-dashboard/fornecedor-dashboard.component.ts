import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { JwtPayload } from '../../../models/perfil.model';

@Component({
  selector: 'app-fornecedor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './fornecedor-dashboard.component.html',
  styleUrls: ['./fornecedor-dashboard.component.css']
})
export class FornecedorDashboardComponent implements OnInit {
  currentUser: JwtPayload | null = null;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('👤 Usuário Fornecedor:', this.currentUser);
  }
}
