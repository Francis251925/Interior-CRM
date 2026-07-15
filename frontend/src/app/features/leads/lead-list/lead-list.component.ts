import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LeadService } from '../../../core/services/lead.service';
import { Lead } from '../../../core/models/models';

@Component({
  selector: 'app-lead-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="header-row">
      <div>
        <h1>Leads</h1>
        <p class="subtitle">Track every customer enquiry through the sales process</p>
      </div>
      <a class="btn btn-primary" routerLink="/leads/new">+ New Lead</a>
    </div>

    <div class="card filters">
      <input class="search" [(ngModel)]="search" (keyup.enter)="load()" placeholder="Search by name, mobile, email or lead number" />
      <select [(ngModel)]="status" (change)="load()">
        <option value="">All Statuses</option>
        <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
      </select>
      <select [(ngModel)]="source" (change)="load()">
        <option value="">All Sources</option>
        <option *ngFor="let s of sources" [value]="s">{{ s }}</option>
      </select>
      <button class="btn btn-secondary" (click)="load()">Filter</button>
    </div>

    <div class="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>Lead #</th><th>Customer</th><th>Mobile</th><th>Property</th><th>Budget</th>
            <th>Source</th><th>Status</th><th>Assigned To</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let lead of leads()" [routerLink]="['/leads', lead.id]" class="row-link">
            <td>{{ lead.leadNumber }}</td>
            <td>{{ lead.customerName }}</td>
            <td>{{ lead.mobile }}</td>
            <td>{{ lead.propertyType }}</td>
            <td>{{ lead.budget ? ('₹' + (lead.budget | number)) : '-' }}</td>
            <td>{{ lead.source }}</td>
            <td><span class="badge" [ngClass]="statusClass(lead.status)">{{ lead.status }}</span></td>
            <td>{{ lead.assignedTo?.employeeName }}</td>
          </tr>
          <tr *ngIf="leads().length === 0"><td colspan="8" class="empty">No leads found.</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
    h1 { margin: 0 0 4px; }
    .subtitle { color: #6b7480; margin: 0; font-size: 14px; }
    .filters { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
    .filters input, .filters select { padding: 9px 11px; border-radius: 7px; border: 1px solid #d7dce3; }
    .search { flex: 1; min-width: 220px; }
    .table-wrap { padding: 0; overflow-x: auto; }
    .row-link { cursor: pointer; }
    .row-link:hover { background: #f7f9fc; }
    .empty { text-align: center; color: #8894a8; padding: 24px; }
    .badge.NEW { background: #eaf0fb; color: #2e5aac; }
    .badge.CONTACTED { background: #fff4e0; color: #b6720a; }
    .badge.SITE_VISIT_PLANNED, .badge.SITE_VISIT_COMPLETED { background: #eef2ff; color: #4a4ac2; }
    .badge.QUOTATION_PENDING, .badge.QUOTATION_SENT { background: #f3e8ff; color: #7c3aed; }
    .badge.WON { background: #e5f7ec; color: #1a8a4a; }
    .badge.LOST { background: #fdecea; color: #c0392b; }
  `],
})
export class LeadListComponent implements OnInit {
  leads = signal<Lead[]>([]);
  search = '';
  status = '';
  source = '';

  statuses = ['NEW', 'CONTACTED', 'SITE_VISIT_PLANNED', 'SITE_VISIT_COMPLETED', 'QUOTATION_PENDING', 'QUOTATION_SENT', 'WON', 'LOST'];
  sources = ['WEBSITE', 'REFERRAL', 'WALK_IN', 'SOCIAL_MEDIA', 'ADVERTISEMENT', 'OTHERS'];

  constructor(private leadService: LeadService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.leadService.list({ search: this.search, status: this.status, source: this.source }).subscribe((res) => this.leads.set(res));
  }

  statusClass(status: string) {
    return status;
  }
}
