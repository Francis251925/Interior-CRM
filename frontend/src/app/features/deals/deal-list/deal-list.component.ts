import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DealService } from '../../../core/services/deal.service';
import { Deal } from '../../../core/models/models';

@Component({
  selector: 'app-deal-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <h1>Deals</h1>
    <p class="subtitle">Monitor business opportunities through to confirmation</p>

    <div class="card filters">
      <input class="search" [(ngModel)]="search" (keyup.enter)="load()" placeholder="Search by deal number or customer" />
      <select [(ngModel)]="stage" (change)="load()">
        <option value="">All Stages</option>
        <option *ngFor="let s of stages" [value]="s">{{ s }}</option>
      </select>
      <button class="btn btn-secondary" (click)="load()">Filter</button>
    </div>

    <div class="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>Deal #</th><th>Customer</th><th>Property</th><th>Budget</th>
            <th>Closure Date</th><th>Probability</th><th>Stage</th><th>Assigned To</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let deal of deals()" [routerLink]="['/deals', deal.id]" class="row-link">
            <td>{{ deal.dealNumber }}</td>
            <td>{{ deal.customerName }}</td>
            <td>{{ deal.propertyType }}</td>
            <td>₹{{ deal.estimatedBudget | number }}</td>
            <td>{{ deal.expectedClosureDate | date: 'mediumDate' }}</td>
            <td>{{ deal.probability }}%</td>
            <td><span class="badge" [ngClass]="deal.stage">{{ deal.stage }}</span></td>
            <td>{{ deal.assignedTo?.employeeName }}</td>
          </tr>
          <tr *ngIf="deals().length === 0"><td colspan="8" class="empty">No deals found.</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    h1 { margin: 0 0 4px; }
    .subtitle { color: #6b7480; margin: 0 0 18px; font-size: 14px; }
    .filters { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
    .filters input, .filters select { padding: 9px 11px; border-radius: 7px; border: 1px solid #d7dce3; }
    .search { flex: 1; min-width: 220px; }
    .table-wrap { padding: 0; overflow-x: auto; }
    .row-link { cursor: pointer; }
    .row-link:hover { background: #f7f9fc; }
    .empty { text-align: center; color: #8894a8; padding: 24px; }
    .badge.DISCUSSION, .badge.REQUIREMENT_GATHERING { background: #eaf0fb; color: #2e5aac; }
    .badge.SITE_MEASUREMENT, .badge.DESIGN { background: #eef2ff; color: #4a4ac2; }
    .badge.QUOTATION, .badge.NEGOTIATION { background: #f3e8ff; color: #7c3aed; }
    .badge.CONFIRMED { background: #e5f7ec; color: #1a8a4a; }
    .badge.LOST { background: #fdecea; color: #c0392b; }
  `],
})
export class DealListComponent implements OnInit {
  deals = signal<Deal[]>([]);
  search = '';
  stage = '';

  stages = ['DISCUSSION', 'REQUIREMENT_GATHERING', 'SITE_MEASUREMENT', 'DESIGN', 'QUOTATION', 'NEGOTIATION', 'CONFIRMED', 'LOST'];

  constructor(private dealService: DealService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.dealService.list({ search: this.search, stage: this.stage }).subscribe((res) => this.deals.set(res));
  }
}
