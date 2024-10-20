import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';

@Component({
  selector: 'app-default-layout',
  standalone: true,
  imports: [RouterOutlet, SideNavComponent],
  templateUrl: './default-layout.component.html',
  styleUrl: './default-layout.component.scss',
})
export class DefaultLayoutComponent {}
