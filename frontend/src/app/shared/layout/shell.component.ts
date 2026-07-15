import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CommonModule],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">Interior CRM</div>
        <nav>
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/leads" routerLinkActive="active">Leads</a>
          <a routerLink="/deals" routerLinkActive="active">Deals</a>
          <a *ngIf="auth.hasRole('ADMIN')" routerLink="/users" routerLinkActive="active">Users</a>
        </nav>
        <div class="user-box">
          <div class="user-name">{{ auth.currentUser()?.employeeName }}</div>
          <div class="user-role">{{ auth.currentUser()?.role }}</div>
          <button class="btn btn-secondary" (click)="auth.logout()">Logout</button>
        </div>
      </aside>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; }
    .sidebar {
      width: 230px;
      background: #1c2534;
      color: #dfe4ee;
      display: flex;
      flex-direction: column;
      padding: 20px 14px;
    }
    .brand { font-weight: 700; font-size: 18px; margin-bottom: 24px; padding: 0 8px; }
    nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
    nav a {
      padding: 10px 12px;
      border-radius: 8px;
      color: #b8c1d1;
      font-size: 14px;
      font-weight: 500;
    }
    nav a:hover { background: #2a3548; color: #fff; }
    nav a.active { background: #2e5aac; color: #fff; }
    .user-box { border-top: 1px solid #313d52; padding-top: 14px; margin-top: 14px; }
    .user-name { font-weight: 600; font-size: 14px; }
    .user-role { font-size: 12px; color: #8894a8; margin-bottom: 10px; }
    .content { flex: 1; padding: 28px 32px; max-width: 100%; overflow-x: auto; }
  `],
})
export class ShellComponent {
  constructor(public auth: AuthService) {}
}
