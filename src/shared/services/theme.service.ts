import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  #platformId = inject(PLATFORM_ID);
  
  $isDarkMode = signal<boolean>(false);
  private readonly THEME_KEY = 'al_theme';

  constructor() {
    if (isPlatformBrowser(this.#platformId)) {
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      if (savedTheme === 'dark') {
        this.$isDarkMode.set(true);
        this.applyTheme(true);
      } else if (savedTheme === 'light') {
        this.$isDarkMode.set(false);
        this.applyTheme(false);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.$isDarkMode.set(prefersDark);
        this.applyTheme(prefersDark);
      }
    }
  }

  toggleTheme() {
    if (isPlatformBrowser(this.#platformId)) {
      const newTheme = !this.$isDarkMode();
      this.$isDarkMode.set(newTheme);
      localStorage.setItem(this.THEME_KEY, newTheme ? 'dark' : 'light');
      this.applyTheme(newTheme);
    }
  }

  private applyTheme(isDark: boolean) {
    if (isDark) {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.setAttribute('data-bs-theme', 'light');
      document.body.classList.remove('dark-theme');
    }
  }
}
