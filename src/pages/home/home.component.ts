import { Component } from '@angular/core';
import { TranslateDirective } from '../../shared/language';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslateDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
