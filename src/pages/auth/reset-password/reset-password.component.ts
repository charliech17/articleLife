import { Component, inject, signal } from '@angular/core';
import { ApiAuthService } from '../../../shared/services/api/api-auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  #apiAuthService = inject(ApiAuthService);
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  passwordControl = new FormControl('', { nonNullable: true });
  confirmPasswordControl = new FormControl('', { nonNullable: true });
  token = '';

  $$resetUserEmail = signal<string>('');

  constructor() {
    this.#route.paramMap.subscribe(params => {
      const token = params.get('token') || '';
      if (!token) {
        this.goBackHome();
      }

      this.token = token;
      this.#apiAuthService.checkIsResetPasswordTokenValid(token).subscribe({
        next: res => {
          this.$$resetUserEmail.set(res.responseData);
        },
        error: err => {
          this.goBackHome();
        },
      });
    });
  }

  goBackHome() {
    this.#router.navigate(['/home'], { replaceUrl: true });
  }

  confirmResetPassword() {
    if (this.passwordControl.value !== this.confirmPasswordControl.value) {
      alert('密碼不一致');
      return;
    }

    this.#apiAuthService.confirmResetPassword(this.token, this.passwordControl.value).subscribe({
      next: () => {
        alert('密碼已重設');
        this.goBackHome();
      },
      error: err => {
        alert('重設密碼失敗' + err);
      },
    });
  }
}
