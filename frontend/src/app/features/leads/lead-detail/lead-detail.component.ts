import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LeadService } from '../../../core/services/lead.service';
import { AuthService } from '../../../core/services/auth.service';
import { Lead } from '../../../core/models/models';

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <ng-container *ngIf="lead() as l">
      <div class="header-row">
        <div>
          <a routerLink="/leads" class="back">← Back to Leads</a>
          <h1>{{ l.customerName }}</h1>
          <p class="subtitle">{{ l.leadNumber }} · Created {{ l.createdAt | date: 'mediumDate' }}</p>
        </div>
        <span class="badge status" [ngClass]="l.status">{{ l.status }}</span>
      </div>

      <div class="grid">
        <div class="card">
          <h3>Customer Information</h3>
          <div class="kv"><span>Mobile</span><span>{{ l.mobile }}</span></div>
          <div class="kv"><span>Email</span><span>{{ l.email || '-' }}</span></div>
          <div class="kv"><span>Location</span><span>{{ l.location || '-' }}</span></div>
          <div class="kv"><span>Property</span><span>{{ l.propertyType }} · {{ l.propertySize || '-' }} sq.ft.</span></div>
          <div class="kv"><span>Budget</span><span>{{ l.budget ? ('₹' + (l.budget | number)) : '-' }}</span></div>
          <div class="kv"><span>Source</span><span>{{ l.source }}</span></div>
        </div>

        <div class="card">
          <h3>Sales Information</h3>
          <div class="kv"><span>Assigned To</span><span>{{ l.assignedTo?.employeeName }}</span></div>
          <div class="kv"><span>Last Updated</span><span>{{ l.updatedAt | date: 'medium' }}</span></div>

          <div class="field" style="margin-top: 14px;">
            <label>Update Status</label>
            <select [(ngModel)]="newStatus">
              <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
            </select>
          </div>
          <button class="btn btn-primary" (click)="updateStatus()" [disabled]="newStatus === l.status">Update Status</button>

          <div *ngIf="l.status === 'WON' && !l.deal" class="convert-box">
            <h4>Convert to Deal</h4>
            <div class="field"><label>Estimated Budget</label><input type="number" [(ngModel)]="convertBudget" /></div>
            <div class="field"><label>Expected Closure Date</label><input type="date" [(ngModel)]="convertDate" /></div>
            <button class="btn btn-primary" (click)="convert()">Convert Lead to Deal</button>
          </div>
          <div *ngIf="l.deal" class="convert-box">
            <p>This lead has been converted to deal <a [routerLink]="['/deals', l.deal.id]">{{ l.deal.dealNumber }}</a>.</p>
          </div>
        </div>
      </div>

      <div class="card notes-card">
        <h3>Notes &amp; Activity</h3>
        <div class="add-note">
          <input [(ngModel)]="noteText" placeholder="Add a follow-up note..." />
          <button class="btn btn-secondary" (click)="addNote()">Add Note</button>
        </div>
        <div class="activity" *ngFor="let a of l.activities">
          <div class="activity-msg">{{ a.message }}</div>
          <div class="activity-meta">{{ a.user?.employeeName }} · {{ a.createdAt | date: 'medium' }}</div>
        </div>
        <p *ngIf="!l.activities?.length" class="empty">No activity yet.</p>
      </div>
    </ng-container>
  `,
  styles: [`
    .back { font-size: 13px; color: #2e5aac; display: inline-block; margin-bottom: 8px; }
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    h1 { margin: 0 0 4px; }
    .subtitle { color: #6b7480; margin: 0; font-size: 14px; }
    .status.NEW { background: #eaf0fb; color: #2e5aac; }
    .status.CONTACTED { background: #fff4e0; color: #b6720a; }
    .status.SITE_VISIT_PLANNED, .status.SITE_VISIT_COMPLETED { background: #eef2ff; color: #4a4ac2; }
    .status.QUOTATION_PENDING, .status.QUOTATION_SENT { background: #f3e8ff; color: #7c3aed; }
    .status.WON { background: #e5f7ec; color: #1a8a4a; }
    .status.LOST { background: #fdecea; color: #c0392b; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    h3 { margin: 0 0 12px; font-size: 15px; }
    .kv { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #f0f2f5; font-size: 14px; }
    .kv span:first-child { color: #6b7480; }
    .convert-box { margin-top: 16px; padding-top: 14px; border-top: 1px solid #eef0f4; }
    .convert-box h4 { margin: 0 0 10px; font-size: 14px; }
    .notes-card .add-note { display: flex; gap: 10px; margin-bottom: 16px; }
    .add-note input { flex: 1; padding: 9px 11px; border-radius: 7px; border: 1px solid #d7dce3; }
    .activity { padding: 10px 0; border-bottom: 1px solid #f0f2f5; }
    .activity-msg { font-size: 14px; }
    .activity-meta { font-size: 12px; color: #8894a8; margin-top: 2px; }
    .empty { color: #8894a8; font-size: 14px; }
  `],
})
export class LeadDetailComponent implements OnInit {
  lead = signal<Lead | null>(null);
  newStatus = '';
  noteText = '';
  convertBudget: number | null = null;
  convertDate = '';

  statuses = ['NEW', 'CONTACTED', 'SITE_VISIT_PLANNED', 'SITE_VISIT_COMPLETED', 'QUOTATION_PENDING', 'QUOTATION_SENT', 'WON', 'LOST'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leadService: LeadService,
    public auth: AuthService,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.leadService.get(id).subscribe((res) => {
      this.lead.set(res);
      this.newStatus = res.status;
      this.convertBudget = res.budget ?? null;
    });
  }

  updateStatus() {
    const l = this.lead();
    if (!l) return;
    this.leadService.update(l.id, { status: this.newStatus as any }).subscribe(() => this.load());
  }

  addNote() {
    const l = this.lead();
    if (!l || !this.noteText.trim()) return;
    this.leadService.addNote(l.id, this.noteText).subscribe(() => {
      this.noteText = '';
      this.load();
    });
  }

  convert() {
    const l = this.lead();
    if (!l || !this.convertBudget || !this.convertDate) return;
    this.leadService
      .convert(l.id, { estimatedBudget: this.convertBudget, expectedClosureDate: this.convertDate })
      .subscribe((deal: any) => this.router.navigate(['/deals', deal.id]));
  }
}
