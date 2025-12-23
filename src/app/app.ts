import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './services/auth.service';
import { FornecedorService } from './services/fornecedor.service';
import { Perfil } from './models/perfil.model';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('portalHackatom');
  contextName: string = '';
  contextIcon: string = '';

  constructor(
    public authService: AuthService,
    private fornecedorService: FornecedorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadContextData(user.perfil);
      } else {
        this.contextName = '';
        this.contextIcon = '';
      }
    });
  }

  private loadContextData(perfil: Perfil): void {
    if (perfil === Perfil.FORNECEDOR) {
      this.contextIcon = 'store';
      this.fornecedorService.getFornecedorMe().subscribe({
        next: (fornecedor) => {
          this.contextName = fornecedor.nome;
        },
        error: () => {
          this.contextName = 'Fornecedor';
        }
      });
    } else if (perfil === Perfil.EMPRESA) {
      this.contextIcon = 'business';
      this.fornecedorService.getEmpresaMe().subscribe({
        next: (empresa) => {
          this.contextName = empresa.razaoSocial || empresa.nome;
        },
        error: () => {
          this.contextName = 'Empresa';
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
