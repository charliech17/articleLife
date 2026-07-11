import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { ApiWishService } from '../../shared/services/api/api-wish/api-wish.service';
import { IWish } from '../../shared/models/wish.models';

@Component({
  selector: 'app-manage-wishes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule
  ],
  templateUrl: './manage-wishes.component.html',
  styleUrls: ['./manage-wishes.component.scss']
})
export class ManageWishesComponent implements OnInit {
  #apiWishService = inject(ApiWishService);

  wishes = signal<IWish[]>([]);
  loading = signal<boolean>(false);
  displayedColumns: string[] = ['id', 'createdAt', 'wishContent', 'wisherName', 'contactEmail', 'actions'];

  startDate: string = '';
  endDate: string = '';

  ngOnInit(): void {
    this.loadWishes();
  }

  loadWishes(): void {
    this.loading.set(true);
    this.#apiWishService.getAdminWishes(this.startDate || null, this.endDate || null).subscribe({
      next: (data) => {
        this.wishes.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load wishes', err);
        this.loading.set(false);
      }
    });
  }

  clearFilter(): void {
    this.startDate = '';
    this.endDate = '';
    this.loadWishes();
  }

  markCompleted(wish: IWish): void {
    if (confirm(`確定要將此許願標記為完成嗎？\n「${wish.wishContent}」\n標記後將不再顯示。`)) {
      this.#apiWishService.markCompleted(wish.id).subscribe({
        next: () => {
          this.loadWishes();
        },
        error: (err) => {
          console.error('Failed to mark wish as completed', err);
        }
      });
    }
  }
}
