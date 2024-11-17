import { Component, computed, ElementRef, input, OnInit, output, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { EditTitleComponent, IEditTitleInput } from '../edit-title/edit-title.component';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [ReactiveFormsModule, EditTitleComponent],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
})
export class TextareaComponent implements OnInit {
  $iptTextarea = input.required<ITextareaInput>({ alias: 'iptTextarea' });
  $cptTextareaClass = computed(() => {
    return `cus-edit_${this.$iptTextarea().headerType}-title`;
  });
  optUpdateText = output<string>();

  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;
  textControl = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.textControl.setValue(this.$iptTextarea().initText);
  }

  handleInputEvent(): void {
    this.resizeTextarea();
  }

  handleChangeEvent(): void {
    this.emitToParent(this.textControl.value);
  }

  resizeTextarea(): void {
    this.textarea.nativeElement.style.height = 'auto';
    this.textarea.nativeElement.style.height = `${this.textarea.nativeElement.scrollHeight}px`;
  }

  emitToParent(newText: string): void {
    // Emit to parent
    this.optUpdateText.emit(newText);
  }
}

interface ITextareaInput {
  headerType: 'h1' | 'h2';
  placeholder: string;
  initText: string;
  titleColor?: IEditTitleInput['color'];
}
