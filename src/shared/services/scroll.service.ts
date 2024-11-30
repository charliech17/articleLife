import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  #platformId = inject(PLATFORM_ID);

  constructor() {}

  scrollToElement(element: HTMLElement, behavior: ScrollBehavior = 'smooth'): void {
    if (isPlatformBrowser(this.#platformId)) {
      element.scrollIntoView({ behavior });
    }
  }

  scrollToTop(): void {
    if (isPlatformBrowser(this.#platformId)) {
      window.scrollTo(0, 0);
    }
  }

  scrollToYPosition(position: number): void {
    if (isPlatformBrowser(this.#platformId)) {
      window.scrollTo(0, position);
    }
  }
}
