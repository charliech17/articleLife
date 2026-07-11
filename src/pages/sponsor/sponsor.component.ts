import { Component, inject, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiSponsorService } from '../../shared/services/api/api-sponsor/api-sponsor.service';
import { SponsorType } from '../../shared/models/sponsor.models';

@Component({
  selector: 'app-sponsor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './sponsor.component.html',
  styleUrls: ['./sponsor.component.scss']
})
export class SponsorComponent {
  #fb = inject(FormBuilder);
  #apiSponsorService = inject(ApiSponsorService);
  #router = inject(Router);
  #document = inject(DOCUMENT);

  readonly presetAmounts = [100, 300, 500, 1000];

  $$selectedAmount = signal<number | null>(300);
  $$isCustomAmount = signal<boolean>(false);
  $$type = signal<SponsorType>('ONE_TIME');
  $$submitting = signal<boolean>(false);
  $$errorMsg = signal<string>('');

  sponsorForm = this.#fb.group({
    customAmount: [null as number | null, [Validators.min(10), Validators.max(100000)]],
    sponsorName: ['', [Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    message: ['', [Validators.maxLength(500)]]
  });

  selectPreset(amount: number): void {
    this.$$selectedAmount.set(amount);
    this.$$isCustomAmount.set(false);
  }

  selectCustom(): void {
    this.$$isCustomAmount.set(true);
    this.$$selectedAmount.set(null);
  }

  setType(type: SponsorType): void {
    this.$$type.set(type);
  }

  get finalAmount(): number | null {
    if (this.$$isCustomAmount()) {
      return this.sponsorForm.value.customAmount ?? null;
    }
    return this.$$selectedAmount();
  }

  submit(): void {
    if (this.$$submitting()) {
      return;
    }

    const amount = this.finalAmount;
    if (!amount || amount < 10 || amount > 100000) {
      this.$$errorMsg.set('請選擇或輸入 10 ~ 100,000 元的贊助金額');
      return;
    }
    if (this.sponsorForm.invalid) {
      this.sponsorForm.markAllAsTouched();
      return;
    }

    this.$$submitting.set(true);
    this.$$errorMsg.set('');

    const value = this.sponsorForm.value;
    this.#apiSponsorService.checkout({
      amount,
      type: this.$$type(),
      sponsorName: value.sponsorName || null,
      email: value.email!,
      message: value.message || null
    }).subscribe({
      next: (res) => {
        // 組 hidden form POST 到綠界託管付款頁（會離開本站）
        this.redirectToEcpay(res.actionUrl, res.params);
      },
      error: () => {
        this.$$submitting.set(false);
        this.$$errorMsg.set('建立贊助訂單失敗，請稍後再試');
      }
    });
  }

  private redirectToEcpay(actionUrl: string, params: Record<string, string>): void {
    const form = this.#document.createElement('form');
    form.method = 'POST';
    form.action = actionUrl;
    form.style.display = 'none';

    Object.entries(params).forEach(([key, value]) => {
      const input = this.#document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    this.#document.body.appendChild(form);
    form.submit();
  }

  goHome(): void {
    this.#router.navigate(['home']);
  }
}
