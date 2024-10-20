import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-edit-title',
  standalone: true,
  imports: [],
  templateUrl: './edit-title.component.html',
  styleUrl: './edit-title.component.scss',
})
export class EditTitleComponent {
  $iptEditTitle = input.required<IEditTitleInput>({ alias: 'iptEditTitle' });
  $cptTitleColor = computed(() => {
    const color = this.$iptEditTitle().color ?? 'black';
    return `cus-edit-title__color-${color}`;
  });
}

export interface IEditTitleInput {
  title: string;
  isHide: boolean;
  color?: 'blue' | 'red' | 'green' | 'black';
}
