import { RouterService } from './../../services/router.service';
import { Component, inject, computed, signal } from '@angular/core';
import { LogoComponent } from '../logo/logo.component';
import { ProfileComponent } from '../profile/profile.component';
import { Router } from '@angular/router';
import { ArticleOutlineComponent } from '../article-outline/article-outline.component';
import { ArticleFilterComponent } from '../../../pages/home/components/article-filter/article-filter.component';
import { GlobalStore } from '../../stores/global.store';
import { ThemeService } from '../../services/theme.service';

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
  #themeService = inject(ThemeService);
  #globalStore = inject(GlobalStore);

  $currentPath = computed(() => this.#routerService.getCurrentPath());
  $isHomePage = computed(() => this.#routerService.getCurrentPath().startsWith('/home'));
  $isDarkMode = this.#themeService.$isDarkMode;
  $isLoggedIn = this.#globalStore.isLoggedIn;
  
  isMobileMenuOpen = signal(false);

  $isAiArticlesPage = computed(() => {
    const path = this.$currentPath();
    return path.includes('articleType=AI') || path.startsWith('/ai-view-article');
  });

  goBackHome(): void {
    this.#routerService.navigateHome();
  }

  toggleAiArticlesPage(): void {
    if (this.$isAiArticlesPage()) {
      this.#router.navigate(['/home']);
    } else {
      this.#router.navigate(['/home'], { queryParams: { articleType: 'AI' } });
    }
  }

  toggleTheme(): void {
    this.#themeService.toggleTheme();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }
}
