import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardSummary } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Dashboard</h1>
    <p class="subtitle">Overview of leads and deals across the sales pipeline</p>

    <ng-container *ngIf="data() as d">
      <h2>Leads</h2>
      <div class="grid">
        <div class="stat card"><div class="label">Total Leads</div><div class="value">{{ d.leads.totalLeads }}</div></div>
        <div class="stat card"><div class="label">New</div><div class="value">{{ d.leads.newLeads }}</div></div>
        <div class="stat card"><div class="label">Contacted</div><div class="value">{{ d.leads.contactedLeads }}</div></div>
        <div class="stat card"><div class="label">Pending Site Visits</div><div class="value">{{ d.leads.pendingSiteVisits }}</div></div>
        <div class="stat card"><div class="label">Quotations Pending</div><div class="value">{{ d.leads.quotationsPending }}</div></div>
        <div class="stat card"><div class="label">Quotations Sent</div><div class="value">{{ d.leads.quotationsSent }}</div></div>
        <div class="stat card"><div class="label">Won</div><div class="value green">{{ d.leads.wonLeads }}</div></div>
        <div class="stat card"><div class="label">Lost</div><div class="value red">{{ d.leads.lostLeads }}</div></div>
        <div class="stat card"><div class="label">Conversion Rate</div><div class="value">{{ d.leads.conversionRate }}%</div></div>
      </div>

      <h2>Deals</h2>
      <div class="grid">
        <div class="stat card"><div class="label">Total Deals</div><div class="value">{{ d.deals.totalDeals }}</div></div>
        <div class="stat card"><div class="label">Active</div><div class="value">{{ d.deals.activeDeals }}</div></div>
        <div class="stat card"><div class="label">Confirmed</div><div class="value green">{{ d.deals.confirmedDeals }}</div></div>
        <div class="stat card"><div class="label">Lost</div><div class="value red">{{ d.deals.lostDeals }}</div></div>
        <div class="stat card"><div class="label">Pipeline Value</div><div class="value">₹{{ d.deals.totalPipelineValue | number }}</div></div>
        <div class="stat card"><div class="label">Expected Revenue</div><div class="value">₹{{ d.deals.expectedRevenue | number }}</div></div>
        <div class="stat card"><div class="label">Win Ratio</div><div class="value">{{ d.deals.winRatio }}%</div></div>
        <div class="stat card"><div class="label">Avg Deal Value</div><div class="value">₹{{ d.deals.averageDealValue | number }}</div></div>
      </div>

      <h2>Deals by Stage</h2>
      <div class="card stage-list">
        <div class="stage-row" *ngFor="let key of stageKeys(d.deals.dealsByStage)">
          <span>{{ key }}</span>
          <span class="badge stage-badge">{{ d.deals.dealsByStage[key] }}</span>
        </div>
        <div *ngIf="stageKeys(d.deals.dealsByStage).length === 0" class="empty">No deals yet.</div>
      </div>
    </ng-container>
  `,
  styles: [`
    h1 { margin: 0 0 4px; }
    .subtitle { color: #6b7480; margin: 0 0 24px; font-size: 14px; }
    h2 { font-size: 15px; margin: 24px 0 12px; color: #33404f; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 14px; }
    .stat { text-align: left; }
    .label { font-size: 12px; color: #6b7480; margin-bottom: 6px; }
    .value { font-size: 24px; font-weight: 700; }
    .value.green { color: #1a8a4a; }
    .value.red { color: #c0392b; }
    .stage-list { display: flex; flex-direction: column; gap: 8px; }
    .stage-row { display: flex; justify-content: space-between; padding: 8px 4px; border-bottom: 1px solid #f0f2f5; font-size: 14px; }
    .stage-row:last-child { border-bottom: none; }
    .stage-badge { background: #eaf0fb; color: #2e5aac; }
    .empty { color: #8894a8; font-size: 14px; }
  `],
})
export class DashboardComponent implements OnInit {
  data = signal<DashboardSummary | null>(null);

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.summary().subscribe((res) => this.data.set(res));
  }

  stageKeys(map: Record<string, number>) {
    return Object.keys(map || {});
  }
}
