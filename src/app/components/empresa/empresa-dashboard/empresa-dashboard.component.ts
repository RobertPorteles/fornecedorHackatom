import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { JwtPayload } from '../../../models/perfil.model';

@Component({
  selector: 'app-empresa-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './empresa-dashboard.component.html',
  styleUrls: ['./empresa-dashboard.component.css']
})
export class EmpresaDashboardComponent implements OnInit {
  currentUser: JwtPayload | null = null;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('👤 Usuário Empresa:', this.currentUser);
  }
}
