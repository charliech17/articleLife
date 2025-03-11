import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiAuthService } from '../../../shared/services/api/api-auth/auth.service';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
})
export class ForgetPasswordComponent {
  acctControl = new FormControl('', { nonNullable: true });
  #apiAuthService = inject(ApiAuthService);

  confirmSendRestPassword(): void {
    if (!this.acctControl.value) {
      alert('請輸入帳號');
      return;
    }

    const randomCode = Math.floor(Math.random() * 1000000);
    const inputCode = window.prompt(`請輸入隨機碼: ${randomCode.toString()}`);
    if (!inputCode || inputCode !== randomCode.toString()) {
      alert('驗證碼錯誤');
      return;
    }

    this.#apiAuthService.sendResetPasswordEmail(this.acctControl.value).subscribe({
      next: res => {
        alert(res.responseData);
      },
      error: err => {
        alert('發送失敗' + err);
      },
    });
  }
}
