import { Component, input, output } from '@angular/core';
import { EditorPanelComponent } from '../components/editor-panel/editor-panel.component';
import { EditorContentComponent } from '../components/editor-content/editor-content.component';
import { IEditorInput } from '../interface/editor.interface';

@Component({
  selector: 'app-editor',
  imports: [EditorPanelComponent, EditorContentComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
  standalone: true,
})
export class EditorComponent {
  $input = input.required<IEditorInput>({ alias: 'input' });
  $output = output<string>({ alias: 'output' });

  constructor() {
    // Initialization logic can go here if needed
  }

  handleOutput() {
    this.$output.emit(this.$input().content);
  }
}
