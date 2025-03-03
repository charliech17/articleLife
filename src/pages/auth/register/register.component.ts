import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiAuthService } from '../../../shared/services/api/api-auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  #router = inject(Router);
  #apiAuthService = inject(ApiAuthService);

  acctControl = new FormControl('', { nonNullable: true });
  pwdControl = new FormControl('', { nonNullable: true });
  confirmPwdControl = new FormControl('', { nonNullable: true });
  canRegister = false;

  ngOnInit(): void {
    this.#apiAuthService.checkCanRegister().subscribe(res => {
      this.canRegister = res.responseData;
    });
  }

  handleRegister(): void {
    this.doValidationOrThrowError();

    this.#apiAuthService.register({ loginId: this.acctControl.value, password: this.pwdControl.value }).subscribe({
      next: res => {
        alert('Register success');
        this.goLoginPage();
      },
      error: err => {
        alert('Register failed');
      },
    });
  }

  private doValidationOrThrowError(): void {
    if (this.acctControl.value === '' || this.pwdControl.value === '' || this.confirmPwdControl.value === '') {
      alert('Please fill in all fields');
      throw new Error('Please fill in all fields');
    }

    if (this.pwdControl.value !== this.confirmPwdControl.value) {
      alert('Password and confirm password are not the same');
      throw new Error('Password and confirm password are not the same');
    }

    if (this.pwdControl.value.length < 6) {
      alert('Password must be at least 6 characters');
      throw new Error('Password must be at least 6 characters');
    }

    if (this.acctControl.value.length < 6) {
      alert('Account must be at least 6 characters');
      throw new Error('Account must be at least 6 characters');
    }

    if (!this.acctControl.value.includes('@') || !this.acctControl.value.includes('.')) {
      alert('Account must be email format');
      throw new Error('Account must be email format');
    }

    if (!this.pwdControl.value.match(/[a-z]/) || !this.pwdControl.value.match(/[A-Z]/) || !this.pwdControl.value.match(/[0-9]/)) {
      alert('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }
  }

  goLoginPage(): void {
    this.#router.navigate(['/login']);
  }
}
