import { Component, output } from '@angular/core';
import { EditSaveButtonComponent } from '../edit-save-button/edit-save-button.component';

@Component({
  selector: 'app-action-section',
  standalone: true,
  imports: [EditSaveButtonComponent],
  templateUrl: './action-section.component.html',
  styleUrl: './action-section.component.scss',
})
export class ActionSectionComponent {
  optSave = output<void>();
  optPublish = output<void>();

  receiveDoSave(): void {
    this.optSave.emit();
  }

  receiveDoPublish(): void {
    this.optPublish.emit();
  }
}
