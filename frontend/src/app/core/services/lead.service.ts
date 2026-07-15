import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Lead } from '../models/models';

@Injectable({ providedIn: 'root' })
export class LeadService {
  private base = `${environment.apiUrl}/leads`;

  constructor(private http: HttpClient) {}

  list(filters: Record<string, string> = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params = params.set(k, v);
    });
    return this.http.get<Lead[]>(this.base, { params });
  }

  get(id: string) {
    return this.http.get<Lead>(`${this.base}/${id}`);
  }

  create(payload: Partial<Lead>) {
    return this.http.post<Lead>(this.base, payload);
  }

  update(id: string, payload: Partial<Lead>) {
    return this.http.put<Lead>(`${this.base}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }

  addNote(id: string, message: string) {
    return this.http.post(`${this.base}/${id}/notes`, { message });
  }

  convert(id: string, payload: { estimatedBudget: number; expectedClosureDate: string; probability?: number; remarks?: string }) {
    return this.http.post(`${this.base}/${id}/convert`, payload);
  }
}
