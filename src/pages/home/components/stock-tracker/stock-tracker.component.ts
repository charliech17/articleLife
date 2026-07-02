import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiStockService, IStock } from '../../../../shared/services/api/api-stock/api-stock.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-stock-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-tracker.component.html',
  styleUrls: ['./stock-tracker.component.scss']
})
export class StockTrackerComponent implements OnInit {
  #apiStock = inject(ApiStockService);
  stocks: IStock[] = [];
  marketIndices: IStock[] = [];
  loading = true;
  error = false;
  Math = Math; // Expose Math to template

  ngOnInit(): void {
    this.fetchStocks();
  }

  fetchStocks(): void {
    this.loading = true;
    
    // Fetch user tracked stocks
    this.#apiStock.getDailyStocks().pipe(
      catchError(err => {
        console.error('Failed to fetch stocks', err);
        this.error = true;
        return of([]);
      })
    ).subscribe((data: IStock[]) => {
      this.stocks = data;
      this.loading = false;
    });

    // Fetch global market indices
    this.#apiStock.getMarketIndices().pipe(
      catchError(err => {
        console.error('Failed to fetch market indices', err);
        return of([]);
      })
    ).subscribe((data: IStock[]) => {
      this.marketIndices = data;
    });
  }

  openStockPopup(event: Event, symbol: string): void {
    event.preventDefault();
    const width = 1000;
    const height = 800;
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);
    const url = `https://finance.yahoo.com/quote/${symbol}`;
    window.open(url, 'stockPopup', `width=${width},height=${height},top=${top},left=${left}`);
  }
}
