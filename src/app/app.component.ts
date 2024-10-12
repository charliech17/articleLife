import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateDirective } from '../shared/language';
import { AllLayoutsComponent } from '../shared/layouts/all-layouts/all-layouts.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AllLayoutsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'articleLife';
}
