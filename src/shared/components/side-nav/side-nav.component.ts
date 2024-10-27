import { Component, inject } from '@angular/core';
import { LogoComponent } from '../logo/logo.component';
import { ProfileComponent } from '../profile/profile.component';
import { Router } from '@angular/router';
import { ArticleOutlineComponent } from '../article-outline/article-outline.component';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [LogoComponent, ProfileComponent, ArticleOutlineComponent],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
})
export class SideNavComponent {
  #router = inject(Router);

  goBackHome(): void {
    this.#router.navigate(['/home']);
  }
}
