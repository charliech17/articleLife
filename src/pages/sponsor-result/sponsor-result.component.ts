import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiSponsorService } from '../../shared/services/api/api-sponsor/api-sponsor.service';
import { ISponsorOrderStatus } from '../../shared/models/sponsor.models';

/**
 * 綠界付款完成導回頁。
 * 因為入帳以後端收到的 server-to-server 通知為準，通知可能比使用者導回晚幾秒，
 * 所以狀態還是 PENDING 時會每 2 秒重查一次，最多 5 次。
 */
@Component({
  selector: 'app-sponsor-result',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './sponsor-result.component.html',
  styleUrls: ['./sponsor-result.component.scss']
})
export class SponsorResultComponent implements OnInit {
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  #apiSponsorService = inject(ApiSponsorService);
  #destroyRef = inject(DestroyRef);

  private static readonly MAX_RETRIES = 5;
  #retries = 0;

  $$viewState = signal<'loading' | 'paid' | 'failed' | 'pending' | 'notFound'>('loading');
  $$order = signal<ISponsorOrderStatus | null>(null);

  ngOnInit(): void {
    const orderNo = this.#route.snapshot.queryParamMap.get('orderNo');
    if (!orderNo) {
      this.$$viewState.set('notFound');
      return;
    }
    this.queryOrder(orderNo);
  }

  private queryOrder(orderNo: string): void {
    this.#apiSponsorService.getOrderStatus(orderNo)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (order) => {
          this.$$order.set(order);
          if (order.status === 'PAID') {
            this.$$viewState.set('paid');
          } else if (order.status === 'FAILED') {
            this.$$viewState.set('failed');
          } else if (this.#retries < SponsorResultComponent.MAX_RETRIES) {
            this.#retries++;
            setTimeout(() => this.queryOrder(orderNo), 2000);
          } else {
            this.$$viewState.set('pending');
          }
        },
        error: () => {
          this.$$viewState.set('notFound');
        }
      });
  }

  goHome(): void {
    this.#router.navigate(['home']);
  }

  goSponsor(): void {
    this.#router.navigate(['sponsor']);
  }
}
