import { Component, inject } from '@angular/core';

import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiAuthService } from '../../../shared/services/api/api-auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  #apiAuthService = inject(ApiAuthService);
  #router = inject(Router);

  acctControl = new FormControl('', { nonNullable: true });
  pwdControl = new FormControl('', { nonNullable: true });

  handleLogin(): void {
    console.log({ username: this.acctControl.value, password: this.pwdControl.value });
    this.#apiAuthService.login({ loginId: this.acctControl.value, password: this.pwdControl.value }).subscribe({
      next: res => {
        alert('Login success');
        this.#router.navigate(['/']);
      },
      error: err => {
        alert('Login failed');
      },
    });
  }

  goRegisterPage(): void {
    this.#router.navigate(['/register']);
  }
}
