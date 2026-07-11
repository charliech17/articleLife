import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiWishService } from '../../shared/services/api/api-wish/api-wish.service';

@Component({
  selector: 'app-wishing-well',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './wishing-well.component.html',
  styleUrls: ['./wishing-well.component.scss']
})
export class WishingWellComponent {
  #fb = inject(FormBuilder);
  #apiWishService = inject(ApiWishService);
  #router = inject(Router);

  $$viewState = signal<'form' | 'done'>('form');
  $$submitting = signal<boolean>(false);
  $$errorMsg = signal<string>('');

  wishForm = this.#fb.group({
    wishContent: ['', [Validators.required, Validators.maxLength(2000)]],
    wisherName: ['', [Validators.maxLength(100)]],
    contactEmail: ['', [Validators.email, Validators.maxLength(255)]]
  });

  submitWish(): void {
    if (this.wishForm.invalid || this.$$submitting()) {
      this.wishForm.markAllAsTouched();
      return;
    }

    this.$$submitting.set(true);
    this.$$errorMsg.set('');

    const value = this.wishForm.value;
    this.#apiWishService.createWish({
      wishContent: value.wishContent!,
      wisherName: value.wisherName || null,
      contactEmail: value.contactEmail || null
    }).subscribe({
      next: () => {
        this.$$submitting.set(false);
        this.$$viewState.set('done');
      },
      error: (err) => {
        this.$$submitting.set(false);
        if (err?.status === 429) {
          this.$$errorMsg.set(typeof err.error === 'string' && err.error ? err.error : '今日許願次數已達上限（每天最多 3 次），請明天再來');
        } else {
          this.$$errorMsg.set('許願失敗，請稍後再試');
        }
      }
    });
  }

  wishAgain(): void {
    this.wishForm.reset();
    this.$$errorMsg.set('');
    this.$$viewState.set('form');
  }

  goHome(): void {
    this.#router.navigate(['home']);
  }
}
