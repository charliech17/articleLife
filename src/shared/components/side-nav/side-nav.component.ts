import { RouterService } from './../../services/router.service';
import { Component, inject, computed } from '@angular/core';
import { LogoComponent } from '../logo/logo.component';
import { ProfileComponent } from '../profile/profile.component';
import { Router } from '@angular/router';
import { ArticleOutlineComponent } from '../article-outline/article-outline.component';
import { ArticleFilterComponent } from '../../../pages/home/components/article-filter/article-filter.component';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [LogoComponent, ProfileComponent, ArticleFilterComponent, ArticleOutlineComponent],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
})
export class SideNavComponent {
  #router = inject(Router);
  #routerService = inject(RouterService);
  $currentPath = computed(() => this.#routerService.getCurrentPath());
  $isHomePage = computed(() => this.#routerService.getCurrentPath().startsWith('/home'));

  goBackHome(): void {
    this.#routerService.navigateHome();
  }
}
