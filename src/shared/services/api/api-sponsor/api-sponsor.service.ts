import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISponsorCheckoutDTO, ISponsorCheckoutResponse, ISponsorOrder, ISponsorOrderStatus } from '../../../models/sponsor.models';

@Injectable({ providedIn: 'root' })
export class ApiSponsorService {
  #http = inject(HttpClient);
  private apiUrl = 'api/sponsor';

  checkout(dto: ISponsorCheckoutDTO): Observable<ISponsorCheckoutResponse> {
    return this.#http.post<ISponsorCheckoutResponse>(`${this.apiUrl}/checkout`, dto);
  }

  getOrderStatus(merchantTradeNo: string): Observable<ISponsorOrderStatus> {
    return this.#http.get<ISponsorOrderStatus>(`${this.apiUrl}/order/${merchantTradeNo}`);
  }

  getAdminOrders(): Observable<ISponsorOrder[]> {
    return this.#http.get<ISponsorOrder[]>(`${this.apiUrl}/admin`);
  }
}
