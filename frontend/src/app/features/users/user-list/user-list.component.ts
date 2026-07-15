import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="header-row">
      <div>
        <h1>Users</h1>
        <p class="subtitle">Manage sales team access and roles</p>
      </div>
      <a class="btn btn-primary" routerLink="/users/new">+ New User</a>
    </div>

    <div class="card table-wrap">
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Mobile</th><th>Role</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of users()">
            <td>{{ u.employeeName }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.mobile }}</td>
            <td>{{ u.role }}</td>
            <td><span class="badge" [class.active]="u.isActive" [class.inactive]="!u.isActive">{{ u.isActive ? 'Active' : 'Inactive' }}</span></td>
            <td><a class="btn btn-secondary" [routerLink]="['/users', u.id, 'edit']">Edit</a></td>
          </tr>
          <tr *ngIf="users().length === 0"><td colspan="6" class="empty">No users found.</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
    h1 { margin: 0 0 4px; }
    .subtitle { color: #6b7480; margin: 0; font-size: 14px; }
    .table-wrap { padding: 0; overflow-x: auto; }
    .empty { text-align: center; color: #8894a8; padding: 24px; }
    .badge.active { background: #e5f7ec; color: #1a8a4a; }
    .badge.inactive { background: #fdecea; color: #c0392b; }
  `],
})
export class UserListComponent implements OnInit {
  users = signal<User[]>([]);

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.list().subscribe((res) => this.users.set(res));
  }
}
