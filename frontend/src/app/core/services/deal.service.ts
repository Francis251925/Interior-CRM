import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Deal } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DealService {
  private base = `${environment.apiUrl}/deals`;

  constructor(private http: HttpClient) {}

  list(filters: Record<string, string> = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params = params.set(k, v);
    });
    return this.http.get<Deal[]>(this.base, { params });
  }

  get(id: string) {
    return this.http.get<Deal>(`${this.base}/${id}`);
  }

  update(id: string, payload: Partial<Deal>) {
    return this.http.put<Deal>(`${this.base}/${id}`, payload);
  }

  updateStage(id: string, stage: string, lostReason?: string) {
    return this.http.patch<Deal>(`${this.base}/${id}/stage`, { stage, lostReason });
  }

  delete(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
