import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ShellComponent } from './shared/layout/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'leads',
        loadComponent: () => import('./features/leads/lead-list/lead-list.component').then((m) => m.LeadListComponent),
      },
      {
        path: 'leads/new',
        loadComponent: () => import('./features/leads/lead-form/lead-form.component').then((m) => m.LeadFormComponent),
      },
      {
        path: 'leads/:id',
        loadComponent: () => import('./features/leads/lead-detail/lead-detail.component').then((m) => m.LeadDetailComponent),
      },
      {
        path: 'deals',
        loadComponent: () => import('./features/deals/deal-list/deal-list.component').then((m) => m.DealListComponent),
      },
      {
        path: 'deals/:id',
        loadComponent: () => import('./features/deals/deal-detail/deal-detail.component').then((m) => m.DealDetailComponent),
      },
      {
        path: 'users',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/users/user-list/user-list.component').then((m) => m.UserListComponent),
      },
      {
        path: 'users/new',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/users/user-form/user-form.component').then((m) => m.UserFormComponent),
      },
      {
        path: 'users/:id/edit',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/users/user-form/user-form.component').then((m) => m.UserFormComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
