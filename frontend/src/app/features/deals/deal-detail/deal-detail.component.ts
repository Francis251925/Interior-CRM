import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DealService } from '../../../core/services/deal.service';
import { Deal } from '../../../core/models/models';

@Component({
  selector: 'app-deal-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <ng-container *ngIf="deal() as d">
      <div class="header-row">
        <div>
          <a routerLink="/deals" class="back">← Back to Deals</a>
          <h1>{{ d.customerName }}</h1>
          <p class="subtitle">{{ d.dealNumber }} · From lead {{ d.lead?.leadNumber }}</p>
        </div>
        <span class="badge stage" [ngClass]="d.stage">{{ d.stage }}</span>
      </div>

      <div class="grid">
        <div class="card">
          <h3>Business Information</h3>
          <div class="kv"><span>Property</span><span>{{ d.propertyType }}</span></div>
          <div class="kv"><span>Estimated Budget</span><span>₹{{ d.estimatedBudget | number }}</span></div>
          <div class="kv"><span>Expected Closure</span><span>{{ d.expectedClosureDate | date: 'mediumDate' }}</span></div>
          <div class="kv"><span>Probability</span><span>{{ d.probability }}%</span></div>
          <div class="kv"><span>Assigned To</span><span>{{ d.assignedTo?.employeeName }}</span></div>
          <div class="kv" *ngIf="d.remarks"><span>Remarks</span><span>{{ d.remarks }}</span></div>
          <div class="kv" *ngIf="d.lostReason"><span>Lost Reason</span><span>{{ d.lostReason }}</span></div>
        </div>

        <div class="card">
          <h3>Update Stage</h3>
          <div class="field">
            <label>Stage</label>
            <select [(ngModel)]="newStage" [disabled]="d.stage === 'CONFIRMED'">
              <option *ngFor="let s of stages" [value]="s">{{ s }}</option>
            </select>
          </div>
          <div class="field" *ngIf="newStage === 'LOST'">
            <label>Reason for Loss</label>
            <input [(ngModel)]="lostReason" placeholder="e.g. Selected another vendor" />
          </div>
          <button class="btn btn-primary" (click)="updateStage()" [disabled]="newStage === d.stage || d.stage === 'CONFIRMED'">
            Update Stage
          </button>
          <p class="note" *ngIf="d.stage === 'CONFIRMED'">Confirmed deals are read-only.</p>
        </div>
      </div>

      <div class="card">
        <h3>Activity Timeline</h3>
        <div class="activity" *ngFor="let a of d.activities">
          <div class="activity-msg">{{ a.message }}</div>
          <div class="activity-meta">{{ a.user?.employeeName }} · {{ a.createdAt | date: 'medium' }}</div>
        </div>
        <p *ngIf="!d.activities?.length" class="empty">No activity yet.</p>
      </div>
    </ng-container>
  `,
  styles: [`
    .back { font-size: 13px; color: #2e5aac; display: inline-block; margin-bottom: 8px; }
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    h1 { margin: 0 0 4px; }
    .subtitle { color: #6b7480; margin: 0; font-size: 14px; }
    .stage.DISCUSSION, .stage.REQUIREMENT_GATHERING { background: #eaf0fb; color: #2e5aac; }
    .stage.SITE_MEASUREMENT, .stage.DESIGN { background: #eef2ff; color: #4a4ac2; }
    .stage.QUOTATION, .stage.NEGOTIATION { background: #f3e8ff; color: #7c3aed; }
    .stage.CONFIRMED { background: #e5f7ec; color: #1a8a4a; }
    .stage.LOST { background: #fdecea; color: #c0392b; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    h3 { margin: 0 0 12px; font-size: 15px; }
    .kv { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #f0f2f5; font-size: 14px; }
    .kv span:first-child { color: #6b7480; }
    .note { font-size: 12px; color: #8894a8; margin-top: 8px; }
    .activity { padding: 10px 0; border-bottom: 1px solid #f0f2f5; }
    .activity-msg { font-size: 14px; }
    .activity-meta { font-size: 12px; color: #8894a8; margin-top: 2px; }
    .empty { color: #8894a8; font-size: 14px; }
  `],
})
export class DealDetailComponent implements OnInit {
  deal = signal<Deal | null>(null);
  newStage = '';
  lostReason = '';

  stages = ['DISCUSSION', 'REQUIREMENT_GATHERING', 'SITE_MEASUREMENT', 'DESIGN', 'QUOTATION', 'NEGOTIATION', 'CONFIRMED', 'LOST'];

  constructor(private route: ActivatedRoute, private dealService: DealService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.dealService.get(id).subscribe((res) => {
      this.deal.set(res);
      this.newStage = res.stage;
    });
  }

  updateStage() {
    const d = this.deal();
    if (!d) return;
    this.dealService.updateStage(d.id, this.newStage, this.lostReason || undefined).subscribe(() => this.load());
  }
}
