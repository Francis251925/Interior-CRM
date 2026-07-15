import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<User[]>(this.base);
  }

  salesStaff() {
    return this.http.get<{ id: string; employeeName: string; role: string }[]>(`${this.base}/sales-staff`);
  }

  get(id: string) {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  create(payload: any) {
    return this.http.post<User>(this.base, payload);
  }

  update(id: string, payload: any) {
    return this.http.put<User>(`${this.base}/${id}`, payload);
  }

  deactivate(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
