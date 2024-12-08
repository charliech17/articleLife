import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AllLayoutsComponent } from '../shared/layouts/all-layouts/all-layouts.component';
import { GlobalService } from '../shared/services/global.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AllLayoutsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'articleLife';
  #globalService = inject(GlobalService);
}
