import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { ApiSponsorService } from '../../shared/services/api/api-sponsor/api-sponsor.service';
import { ISponsorOrder, SponsorStatus } from '../../shared/models/sponsor.models';

type StatusFilter = 'ALL' | SponsorStatus;

@Component({
  selector: 'app-manage-sponsors',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatTableModule
  ],
  templateUrl: './manage-sponsors.component.html',
  styleUrls: ['./manage-sponsors.component.scss']
})
export class ManageSponsorsComponent implements OnInit {
  #apiSponsorService = inject(ApiSponsorService);

  orders = signal<ISponsorOrder[]>([]);
  loading = signal<boolean>(false);
  statusFilter = signal<StatusFilter>('ALL');

  filteredOrders = computed(() => {
    const filter = this.statusFilter();
    const orders = this.orders();
    return filter === 'ALL' ? orders : orders.filter(o => o.status === filter);
  });

  totalPaidAmount = computed(() =>
    this.orders()
      .filter(o => o.status === 'PAID')
      .reduce((sum, o) => sum + o.amount * (o.type === 'RECURRING' ? (o.totalSuccessTimes || 1) : 1), 0)
  );

  displayedColumns: string[] = ['createdAt', 'merchantTradeNo', 'sponsorName', 'email', 'amount', 'type', 'status', 'message'];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.#apiSponsorService.getAdminOrders().subscribe({
      next: (data) => {
        this.orders.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load sponsor orders', err);
        this.loading.set(false);
      }
    });
  }

  setStatusFilter(filter: StatusFilter): void {
    this.statusFilter.set(filter);
  }

  typeText(order: ISponsorOrder): string {
    if (order.type === 'RECURRING') {
      return `每月定期（第 ${order.totalSuccessTimes || 0} 期）`;
    }
    return '單次';
  }

  statusText(status: SponsorStatus): string {
    switch (status) {
      case 'PAID': return '已付款';
      case 'PENDING': return '待付款';
      case 'FAILED': return '失敗';
      default: return status;
    }
  }
}
