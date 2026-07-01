import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-manage-index',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './manage-index.component.html',
  styleUrls: ['./manage-index.component.scss']
})
export class ManageIndexComponent {
  #router = inject(Router);

  goTo(path: string): void {
    this.#router.navigate([path]);
  }
}
