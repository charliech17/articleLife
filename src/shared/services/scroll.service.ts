import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  constructor() {}

  scrollToElement(element: HTMLElement, behavior: ScrollBehavior = 'smooth'): void {
    element.scrollIntoView({ behavior });
  }

  scrollToTop(): void {
    window.scrollTo(0, 0);
  }

  scrollToYPosition(position: number): void {
    window.scrollTo(0, position);
  }
}
