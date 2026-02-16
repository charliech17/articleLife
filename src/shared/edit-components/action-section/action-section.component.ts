import { Component, input, output } from '@angular/core';
import { EditSaveButtonComponent } from '../edit-save-button/edit-save-button.component';

@Component({
  selector: 'app-action-section',
  standalone: true,
  imports: [EditSaveButtonComponent],
  templateUrl: './action-section.component.html',
  styleUrl: './action-section.component.scss',
})
export class ActionSectionComponent {
  $inputAction = input.required<IInputAction>({ alias: 'inputAction' });
  optSave = output<void>();
  optPublish = output<void>();
  optEditCategories = output<void>();
  optEditArticleType = output<void>();

  receiveDoSave(): void {
    this.optSave.emit();
  }

  receiveDoPublish(): void {
    this.optPublish.emit();
  }

  receiveEditCategories(): void {
    this.optEditCategories.emit();
  }
}

interface IInputAction {
  isEdit: boolean;
}
