import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  #$$currLayout = signal<LayoutEnums>(LayoutEnums.default);
  $currLayout = this.#$$currLayout.asReadonly();

  setLayout(newLayout: LayoutEnums): void {
    this.#$$currLayout.set(newLayout);
  }
}

export enum LayoutEnums {
  default = 'default',
}
