import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LeadService } from '../../../core/services/lead.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h1>New Lead</h1>
    <p class="subtitle">Capture a new customer enquiry</p>

    <form class="card" [formGroup]="form" (ngSubmit)="submit()">
      <div class="row">
        <div class="field">
          <label>Customer Name *</label>
          <input formControlName="customerName" />
        </div>
        <div class="field">
          <label>Mobile Number *</label>
          <input formControlName="mobile" />
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label>Email Address</label>
          <input formControlName="email" />
        </div>
        <div class="field">
          <label>Location</label>
          <input formControlName="location" />
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label>Property Type *</label>
          <select formControlName="propertyType">
            <option value="APARTMENT">Apartment</option>
            <option value="VILLA">Villa</option>
            <option value="HOUSE">House</option>
            <option value="OFFICE">Office</option>
            <option value="COMMERCIAL">Commercial</option>
          </select>
        </div>
        <div class="field">
          <label>Property Size (Sq.ft.)</label>
          <input type="number" formControlName="propertySize" />
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label>Estimated Budget</label>
          <input type="number" formControlName="budget" />
        </div>
        <div class="field">
          <label>Lead Source *</label>
          <select formControlName="source">
            <option value="WEBSITE">Website</option>
            <option value="REFERRAL">Referral</option>
            <option value="WALK_IN">Walk-in</option>
            <option value="SOCIAL_MEDIA">Social Media</option>
            <option value="ADVERTISEMENT">Advertisement</option>
            <option value="OTHERS">Others</option>
          </select>
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label>Assigned To *</label>
          <select formControlName="assignedToId">
            <option value="" disabled>Select sales executive</option>
            <option *ngFor="let u of staff()" [value]="u.id">{{ u.employeeName }} ({{ u.role }})</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label>Notes</label>
        <textarea rows="3" formControlName="notes"></textarea>
      </div>

      <p class="error-text" *ngIf="error()">{{ error() }}</p>

      <div class="actions">
        <button type="button" class="btn btn-secondary" (click)="cancel()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Saving...' : 'Create Lead' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    h1 { margin: 0 0 4px; }
    .subtitle { color: #6b7480; margin: 0 0 18px; font-size: 14px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
    textarea { padding: 9px 11px; border-radius: 7px; border: 1px solid #d7dce3; font-family: inherit; }
  `],
})
export class LeadFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private leadService = inject(LeadService);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  staff = signal<{ id: string; employeeName: string; role: string }[]>([]);
  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    customerName: ['', Validators.required],
    mobile: ['', Validators.required],
    email: [''],
    location: [''],
    propertyType: ['APARTMENT', Validators.required],
    propertySize: [null as number | null],
    budget: [null as number | null],
    source: ['WEBSITE', Validators.required],
    assignedToId: ['', Validators.required],
    notes: [''],
  });

  ngOnInit() {
    this.userService.salesStaff().subscribe((res) => this.staff.set(res));
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.leadService.create(this.form.value as any).subscribe({
      next: (lead) => {
        this.loading.set(false);
        this.router.navigate(['/leads', lead.id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Unable to create lead.');
      },
    });
  }

  cancel() {
    this.router.navigate(['/leads']);
  }
}
