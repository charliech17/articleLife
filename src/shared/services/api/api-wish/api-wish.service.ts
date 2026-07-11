import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IWish, IWishCreateDTO } from '../../../models/wish.models';

@Injectable({ providedIn: 'root' })
export class ApiWishService {
  #http = inject(HttpClient);
  private apiUrl = 'api/wishes';

  createWish(wishData: IWishCreateDTO): Observable<void> {
    return this.#http.post<void>(`${this.apiUrl}`, wishData);
  }

  getAdminWishes(startDate?: string | null, endDate?: string | null): Observable<IWish[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.#http.get<IWish[]>(`${this.apiUrl}/admin`, { params });
  }

  markCompleted(wishId: number): Observable<void> {
    return this.#http.post<void>(`${this.apiUrl}/admin/complete/${wishId}`, {});
  }
}
