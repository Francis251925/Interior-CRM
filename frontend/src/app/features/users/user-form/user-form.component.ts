import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h1>{{ isEdit() ? 'Edit User' : 'New User' }}</h1>
    <p class="subtitle">{{ isEdit() ? 'Update employee access and role' : 'Add a new team member' }}</p>

    <form class="card" [formGroup]="form" (ngSubmit)="submit()">
      <div class="row">
        <div class="field"><label>Employee Name *</label><input formControlName="employeeName" /></div>
        <div class="field"><label>Email Address *</label><input formControlName="email" /></div>
      </div>
      <div class="row">
        <div class="field"><label>Mobile Number *</label><input formControlName="mobile" /></div>
        <div class="field">
          <label>Role *</label>
          <select formControlName="role">
            <option value="ADMIN">Administrator</option>
            <option value="SALES_MANAGER">Sales Manager</option>
            <option value="SALES_EXECUTIVE">Sales Executive</option>
          </select>
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label>{{ isEdit() ? 'New Password (leave blank to keep unchanged)' : 'Password *' }}</label>
          <input type="password" formControlName="password" />
        </div>
        <div class="field" *ngIf="isEdit()">
          <label>Status</label>
          <select formControlName="isActive">
            <option [ngValue]="true">Active</option>
            <option [ngValue]="false">Inactive</option>
          </select>
        </div>
      </div>

      <p class="error-text" *ngIf="error()">{{ error() }}</p>

      <div class="actions">
        <button type="button" class="btn btn-secondary" (click)="router.navigate(['/users'])">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Saving...' : (isEdit() ? 'Save Changes' : 'Create User') }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    h1 { margin: 0 0 4px; }
    .subtitle { color: #6b7480; margin: 0 0 18px; font-size: 14px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
  `],
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  public router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  error = signal('');
  userId: string | null = null;

  form = this.fb.group({
    employeeName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobile: ['', Validators.required],
    role: ['SALES_EXECUTIVE', Validators.required],
    password: [''],
    isActive: [true],
  });

  isEdit() {
    return !!this.userId;
  }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.form.get('password')?.clearValidators();
      this.userService.get(this.userId).subscribe((u) => {
        this.form.patchValue({
          employeeName: u.employeeName,
          email: u.email,
          mobile: u.mobile,
          role: u.role,
          isActive: u.isActive,
        });
      });
    } else {
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const payload: any = { ...this.form.value };
    if (!payload.password) delete payload.password;
    if (!this.userId) delete payload.isActive;

    const action = this.userId ? this.userService.update(this.userId, payload) : this.userService.create(payload);
    action.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/users']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Unable to save user.');
      },
    });
  }
}
