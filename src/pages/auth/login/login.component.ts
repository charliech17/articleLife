import { GlobalService } from './../../../shared/services/global.service';
import { AfterViewInit, Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';

import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiAuthService } from '../../../shared/services/api/api-auth/auth.service';
import { GoogleSigninService } from '../../../shared/services/google-signin.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements AfterViewInit {
  #apiAuthService = inject(ApiAuthService);
  #router = inject(Router);
  #globalService = inject(GlobalService);
  #googleSigninService = inject(GoogleSigninService);

  @ViewChild('googleBtn') googleBtn?: ElementRef<HTMLElement>;

  acctControl = new FormControl('', { nonNullable: true });
  pwdControl = new FormControl('', { nonNullable: true });
  authCodeControl = new FormControl('', { nonNullable: true });
  pressedCtrl = false;

  ngAfterViewInit(): void {
    if (this.googleBtn) {
      this.#googleSigninService.renderButton(this.googleBtn.nativeElement, credential => this.handleGoogleLogin(credential));
    }
  }

  handleGoogleLogin(credential: string): void {
    this.#apiAuthService.googleAuth(credential).subscribe({
      next: res => {
        alert('Google 登入成功');
        this.#globalService.callApiWhenReloadOrLogin();
        this.#router.navigate(['/']);
      },
      error: err => {
        alert('Google 登入失敗');
      },
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Control' || event.key === 'Meta') {
      this.pressedCtrl = true;
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Control' || event.key === 'Meta') {
      this.pressedCtrl = false;
    }
  }

  handleLogin(): void {
    this.#apiAuthService
      .login({ loginId: this.acctControl.value, password: this.pwdControl.value, twoFactorCode: this.authCodeControl.value })
      .subscribe({
        next: res => {
          alert('Login success');
          this.#globalService.callApiWhenReloadOrLogin();
          this.#router.navigate(['/']);
        },
        error: err => {
          alert('Login failed');
        },
      });
  }

  goForgetPassword() {
    this.#router.navigate(['/forget-password']);
  }

  sendAuthCode(event: MouseEvent): void {
    if (!(event.screenX && event.screenX != 0 && event.screenY && event.screenY != 0)) {
      alert('請滿足條件才能發送驗證碼');
      return;
    }

    if (!this.acctControl.value) {
      alert('請輸入帳號並滿足條件才能發送驗證碼');
      return;
    }

    const randomCode = Math.floor(Math.random() * 1000000);
    const inputCode = window.prompt(`請輸入隨機碼: ${randomCode.toString()}`);
    if (!inputCode || inputCode !== randomCode.toString()) {
      alert('驗證碼錯誤');
      return;
    }

    this.#apiAuthService.sendAuthCode(this.acctControl.value).subscribe({
      next: res => {
        if (res.responseData) {
          alert('Auth code sent');
        }
      },
      error: err => {
        console.log(err);
        alert(err.message);
      },
    });
  }

  goRegisterPage(): void {
    this.#router.navigate(['/register']);
  }
}
