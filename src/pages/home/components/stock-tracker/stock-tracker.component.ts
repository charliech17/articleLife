import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiStockService, IStock } from '../../../../shared/services/api/api-stock/api-stock.service';
import { catchError, of, forkJoin, finalize } from 'rxjs';
import { AppUtil } from '../../../../shared/utils/app.util';

@Component({
  selector: 'app-stock-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-tracker.component.html',
  styleUrls: ['./stock-tracker.component.scss']
})
export class StockTrackerComponent implements OnInit {
  #apiStock = inject(ApiStockService);

  stocks = signal<IStock[]>([]);
  marketIndices = signal<IStock[]>([]);
  loading = signal(true);
  error = signal(false);

  Math = Math; // Expose Math to template

  ngOnInit(): void {
    this.fetchStocks();
  }

  fetchStocks(): void {
    if (this.loading() && this.stocks().length > 0) return;
    this.loading.set(true);

    forkJoin({
      stocks: this.#apiStock.getDailyStocks().pipe(
        catchError(err => {
          console.error('Failed to fetch stocks', err);
          this.error.set(true);
          return of([]);
        })
      ),
      indices: this.#apiStock.getMarketIndices().pipe(
        catchError(err => {
          console.error('Failed to fetch market indices', err);
          return of([]);
        })
      )
    }).pipe(
      finalize(() => {
        // Ensure visual feedback is given to the user
        setTimeout(() => {
          this.loading.set(false);
        }, 600);
      })
    ).subscribe(({ stocks, indices }) => {
      this.stocks.set(stocks);
      this.marketIndices.set(indices);
    });
  }

  openStockPopup(event: Event, symbol: string): void {
    event.preventDefault();
    const isMobile = AppUtil.isMobileDevice();
    const targetName = isMobile ? '_blank' : 'stockPopup';
    const width = 1000;
    const height = 800;
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);
    const url = `https://finance.yahoo.com/quote/${symbol}`;
    window.open(url, targetName, `width=${width},height=${height},top=${top},left=${left}`);
  }
}
