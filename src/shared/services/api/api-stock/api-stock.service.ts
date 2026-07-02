import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface IStock {
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange: number;
  percentChange: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class ApiStockService {
  #http = inject(HttpClient);
  private apiUrl = 'api/stocks';

  constructor() { }

  getDailyStocks(): Observable<IStock[]> {
    return this.#http.get<IStock[]>(this.apiUrl);
  }

  getMarketIndices(): Observable<IStock[]> {
    return this.#http.get<IStock[]>(`${this.apiUrl}/indices`);
  }
}
