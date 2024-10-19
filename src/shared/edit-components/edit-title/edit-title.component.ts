import { Component, input } from '@angular/core';

@Component({
  selector: 'app-edit-title',
  standalone: true,
  imports: [],
  templateUrl: './edit-title.component.html',
  styleUrl: './edit-title.component.scss',
})
export class EditTitleComponent {
  $iptEditTitle = input.required<IEditTitleInput>({ alias: 'iptEditTitle' });
}

interface IEditTitleInput {
  title: string;
  isHide: boolean;
}
