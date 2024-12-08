import { Router } from '@angular/router';
import { ApiAuthService } from '../../services/api/api-auth/auth.service';
import { GlobalStore } from './../../stores/global.store';
import { Component, computed, inject } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  #globalStore = inject(GlobalStore);
  #apiAuthService = inject(ApiAuthService);
  $userInfo = computed(() => this.#globalStore.userInfo());
  #router = inject(Router);

  logoutUser(): void {
    this.#apiAuthService.logout().subscribe({
      next: res => {
        this.#router.navigate(['/']);
      },
      error: err => {
        alert('Logout failed');
      },
    });
  }
}
