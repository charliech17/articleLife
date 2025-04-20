import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RouterService {
  #router = inject(Router);
  $$currentPath = signal<string>(this.#router.url);

  constructor() {
    this.#router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.$$currentPath.set(this.#router.url);
    });
  }

  getCurrentPath(): string {
    return this.$$currentPath();
  }
}
