import { Component, input, output } from '@angular/core';
import e from 'express';

@Component({
  selector: 'app-edit-save-button',
  standalone: true,
  imports: [],
  templateUrl: './edit-save-button.component.html',
  styleUrl: './edit-save-button.component.scss',
})
export class EditSaveButtonComponent {
  $iptEditSaveButton = input.required<IEditSaveButtonInput>({ alias: 'iptEditSaveButton' });
  optSave = output<void>();

  doSave(): void {
    this.optSave.emit();
  }
}

export interface IEditSaveButtonInput {
  buttonText: string;
}
