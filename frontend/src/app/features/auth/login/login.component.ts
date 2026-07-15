import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-wrap">
      <form class="login-card" [formGroup]="form" (ngSubmit)="submit()">
        <h1>Interior CRM</h1>
        <p class="subtitle">Sign in to manage leads and deals</p>

        <div class="field">
          <label>Email Address</label>
          <input type="email" formControlName="email" placeholder="you@uniqueframe.com" />
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" formControlName="password" placeholder="••••••••" />
        </div>

        <p class="error-text" *ngIf="error()">{{ error() }}</p>

        <button class="btn btn-primary full" type="submit" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Signing in...' : 'Sign In' }}
        </button>

        <div class="hint">
          <strong>Demo credentials</strong>
          <div>admin&#64;uniqueframe.com / Password&#64;123</div>
          <div>manager&#64;uniqueframe.com / Password&#64;123</div>
          <div>exec1&#64;uniqueframe.com / Password&#64;123</div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .login-wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1c2534, #2e5aac);
    }
    .login-card {
      background: #fff;
      padding: 36px;
      border-radius: 14px;
      width: 360px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.25);
    }
    h1 { margin: 0 0 4px; font-size: 22px; }
    .subtitle { margin: 0 0 22px; color: #6b7480; font-size: 13px; }
    .full { width: 100%; padding: 11px; margin-top: 6px; }
    .hint {
      margin-top: 20px;
      padding: 12px;
      background: #f4f6f9;
      border-radius: 8px;
      font-size: 12px;
      color: #55606f;
      line-height: 1.6;
    }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Unable to sign in. Please check your credentials.');
      },
    });
  }
}
