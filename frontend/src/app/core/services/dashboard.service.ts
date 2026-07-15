import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DashboardSummary } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private base = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  summary() {
    return this.http.get<DashboardSummary>(`${this.base}/summary`);
  }
}
