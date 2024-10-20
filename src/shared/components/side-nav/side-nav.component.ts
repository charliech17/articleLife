import { Component } from '@angular/core';
import { LogoComponent } from '../logo/logo.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [LogoComponent, ProfileComponent],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
})
export class SideNavComponent {}
