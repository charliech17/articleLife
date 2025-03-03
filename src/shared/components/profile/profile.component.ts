import { Router } from '@angular/router';
import { ApiAuthService } from '../../services/api/api-auth/auth.service';
import { GlobalStore } from './../../stores/global.store';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ApiMottoService } from '../../services/api/api-motto/api-motto.service';
import { IMotto } from '../../models/motto.models';
import { environment } from '../../env/env';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  #globalStore = inject(GlobalStore);
  #apiAuthService = inject(ApiAuthService);
  #apiMottoService = inject(ApiMottoService);

  $userInfo = computed(() => this.#globalStore.userInfo());
  $userProfileImage = computed(() => this.$userInfo() ?  environment.apiPath + this.$userInfo().profileImage : '');
  #router = inject(Router);

  $$mottoText = signal<IMotto | null>(null);

  ngOnInit(): void {
    this.getRandomMotto();
  }

  getRandomMotto(): void {
    this.#apiMottoService.getRandomMotto().subscribe({
      next: res => {
        console.log(res);
        this.$$mottoText.set(res);
      },
      error: err => {
        console.log(err);
        alert('Failed to get a random motto');
      },
    });
  }

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
