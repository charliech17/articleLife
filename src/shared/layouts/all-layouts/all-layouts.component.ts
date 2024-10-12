import { LayoutEnums, LayoutService } from './layout.service';
import { Component, signal, inject } from '@angular/core';
import { DefaultLayoutComponent } from '../default-layout/default-layout.component';

@Component({
  selector: 'app-all-layouts',
  standalone: true,
  imports: [DefaultLayoutComponent],
  templateUrl: './all-layouts.component.html',
  styleUrl: './all-layouts.component.scss',
})
export class AllLayoutsComponent {
  #layoutService = inject(LayoutService);
  $currLayout = this.#layoutService.$currLayout;

  LAYOUT_ENUMS = LayoutEnums;
}
