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
  $currentArticleInfo = computed(() => this.#globalStore.currentArticleInfo());
  $userProfileImage = computed(() => (this.$userInfo() ? environment.apiPath + this.$userInfo().profileImage : ''));
  #router = inject(Router);
  $router = computed(() => this.#router);
  $isViewSelfArticle = computed(() => this.$userInfo().loginId === this.$currentArticleInfo()?.authorId);

  $$mottoText = signal<IMotto | null>(null);

  ngOnInit(): void {
    this.getRandomMotto();
  }

  getRandomMotto(): void {
    this.#apiMottoService.getRandomMotto().subscribe({
      next: res => {
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

  goToLogin(): void {
    this.#router.navigate(['/login']);
  }

  goAddNewArticle(): void {
    this.#router.navigate(['/add-article']);
  }

  goToEditArticle(): void {
    if (!this.$currentArticleInfo()) {
      alert('No article is selected');
      throw new Error('No article is selected');
    }
    this.#router.navigate([`/edit-article/${this.$currentArticleInfo()?.id}`]);
  }

  goToHome(): void {
    this.#router.navigate(['/']);
  }
}
